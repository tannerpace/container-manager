import { FitAddon } from "@xterm/addon-fit"
import { WebLinksAddon } from "@xterm/addon-web-links"
import { Terminal as XTerm } from "@xterm/xterm"
import "@xterm/xterm/css/xterm.css"
import { useCallback, useEffect, useRef, useState } from "react"
import "./Terminal.css"

interface TerminalProps {
  containerId: string
  containerName?: string
  onClose: () => void
  showHeader?: boolean
}

export function Terminal({
  containerId,
  containerName,
  onClose,
  showHeader = true,
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeCommand = useCallback(
    async (command: string) => {
      const terminal = xtermRef.current
      if (!terminal) return

      try {
        // Create a new exec instance for the command
        const execResponse = await fetch(
          `http://localhost:2375/containers/${containerId}/exec`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              AttachStdout: true,
              AttachStderr: true,
              Tty: false,
              Cmd: ["/bin/sh", "-c", command],
            }),
          }
        )

        if (!execResponse.ok) {
          throw new Error(
            `Failed to create exec instance: ${execResponse.statusText}`
          )
        }

        const { Id: newExecId } = await execResponse.json()

        // Start the exec instance and get output
        const startResponse = await fetch(
          `http://localhost:2375/exec/${newExecId}/start`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Detach: false,
              Tty: false,
            }),
          }
        )

        if (startResponse.ok) {
          const output = await startResponse.text()
          if (output) {
            terminal.writeln(output)
          }
        }
      } catch (err) {
        console.error("Command execution error:", err)
        terminal.writeln(
          `\x1b[31mError: ${
            err instanceof Error ? err.message : "Command failed"
          }\x1b[0m`
        )
      }

      terminal.write("$ ")
    },
    [containerId]
  )

  const startExecInstance = useCallback(
    async (execId: string) => {
      if (!xtermRef.current) return

      setIsConnecting(true)
      setError(null)

      try {
        // Start the exec instance via HTTP POST
        const startResponse = await fetch(
          `http://localhost:2375/exec/${execId}/start`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Detach: false,
              Tty: true,
            }),
          }
        )

        if (!startResponse.ok) {
          throw new Error(
            `Failed to start exec instance: ${startResponse.statusText}`
          )
        }

        // Since Docker API doesn't support WebSocket directly, we'll simulate terminal functionality
        setIsConnected(true)
        setIsConnecting(false)

        // Welcome message
        xtermRef.current?.writeln(
          "\x1b[32m✓ Connected to container terminal\x1b[0m"
        )
        xtermRef.current?.writeln(
          "\x1b[90mContainer: " +
            (containerName || containerId.substring(0, 12)) +
            "\x1b[0m"
        )
        xtermRef.current?.writeln("")
        xtermRef.current?.write("$ ")

        // Handle terminal input
        let currentLine = ""

        xtermRef.current.onData((data: string) => {
          const terminal = xtermRef.current
          if (!terminal) return

          if (data === "\r" || data === "\n") {
            // Enter key pressed - execute command
            terminal.writeln("")
            if (currentLine.trim()) {
              executeCommand(currentLine.trim())
            } else {
              terminal.write("$ ")
            }
            currentLine = ""
          } else if (data === "\x7f" || data === "\b") {
            // Backspace
            if (currentLine.length > 0) {
              currentLine = currentLine.slice(0, -1)
              terminal.write("\b \b")
            }
          } else if (data >= " " || data === "\t") {
            // Printable characters and tab
            currentLine += data
            terminal.write(data)
          }
        })
      } catch (err) {
        console.error("Failed to start exec instance:", err)
        setError(
          err instanceof Error ? err.message : "Failed to start exec instance"
        )
        setIsConnecting(false)
      }
    },
    [containerName, containerId, executeCommand]
  )

  const connectToContainer = useCallback(async () => {
    if (!xtermRef.current) return

    setIsConnecting(true)
    setError(null)

    try {
      // Create exec instance via Docker API
      const response = await fetch(
        `http://localhost:2375/containers/${containerId}/exec`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: ["/bin/sh"], // Try /bin/sh first, fallback to others if needed
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to create exec instance: ${response.statusText}`
        )
      }

      const { Id: execId } = await response.json()

      // Start the exec instance
      startExecInstance(execId)
    } catch (err) {
      console.error("Failed to connect to container:", err)
      setError(
        err instanceof Error ? err.message : "Failed to connect to container"
      )
      setIsConnecting(false)
    }
  }, [containerId, startExecInstance])
  useEffect(() => {
    if (!terminalRef.current) return

    // Initialize xterm.js
    const xterm = new XTerm({
      theme: {
        background: "#1a1a1a",
        foreground: "#ffffff",
        cursor: "#ffffff",
        selectionBackground: "rgba(255, 255, 255, 0.3)",
        black: "#1a1a1a",
        red: "#ff453a",
        green: "#30d158",
        yellow: "#ffd60a",
        blue: "#007aff",
        magenta: "#af52de",
        cyan: "#55bef0",
        white: "#ffffff",
        brightBlack: "#666666",
        brightRed: "#ff6961",
        brightGreen: "#52d681",
        brightYellow: "#ffeb3b",
        brightBlue: "#409cff",
        brightMagenta: "#bf5af2",
        brightCyan: "#70c0e8",
        brightWhite: "#ffffff",
      },
      fontFamily:
        '"Cascadia Code", "Fira Code", "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: 14,
      fontWeight: "normal",
      lineHeight: 1.2,
      letterSpacing: 0,
      cursorBlink: true,
      cursorStyle: "block",
      scrollback: 10000,
      tabStopWidth: 4,
      convertEol: true,
    })

    // Add addons
    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    xterm.loadAddon(fitAddon)
    xterm.loadAddon(webLinksAddon)

    // Open terminal
    xterm.open(terminalRef.current)
    fitAddon.fit()

    // Store references
    xtermRef.current = xterm
    fitAddonRef.current = fitAddon

    // Connect to container
    connectToContainer()

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit()
    }
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      xterm.dispose()
    }
  }, [containerId, connectToContainer])

  const handleReconnect = () => {
    connectToContainer()
  }

  const handleFitToWindow = () => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit()
    }
  }

  return (
    <div className="terminal-container">
      {showHeader && (
        <div className="terminal-header">
          <div className="terminal-title">
            <div className="terminal-icon">💻</div>
            <span>
              Terminal - {containerName || containerId.substring(0, 12)}
            </span>
            {isConnecting && (
              <div className="connecting-indicator">Connecting...</div>
            )}
            {isConnected && <div className="connected-indicator">●</div>}
          </div>
          <div className="terminal-actions">
            <button
              onClick={handleFitToWindow}
              className="terminal-action-btn"
              data-tooltip="Fit to window"
            >
              ⤢
            </button>
            <button
              onClick={handleReconnect}
              className="terminal-action-btn"
              data-tooltip="Reconnect"
              disabled={isConnecting}
            >
              🔄
            </button>
            <button
              onClick={onClose}
              className="terminal-action-btn close-btn"
              data-tooltip="Close terminal"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="terminal-error">
          <div className="error-icon">⚠️</div>
          <div className="error-message">
            <strong>Connection Error:</strong> {error}
            <button onClick={handleReconnect} className="retry-btn">
              Retry Connection
            </button>
          </div>
        </div>
      )}

      <div className="terminal-content">
        <div ref={terminalRef} className="xterm-container" />
      </div>
    </div>
  )
}
