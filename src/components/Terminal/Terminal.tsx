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
}

export function Terminal({
  containerId,
  containerName,
  onClose,
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWebSocket = useCallback(
    (execId: string) => {
      if (!xtermRef.current) return

      // Create WebSocket connection to Docker daemon
      // Note: This is a simplified approach. In production, you'd want a WebSocket proxy server
      const wsUrl = `ws://localhost:2375/exec/${execId}/start`

      try {
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          setIsConnected(true)
          setIsConnecting(false)
          setError(null)

          // Start the exec instance
          ws.send(
            JSON.stringify({
              Detach: false,
              Tty: true,
            })
          )

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
        }

        ws.onmessage = (event) => {
          if (xtermRef.current && event.data) {
            xtermRef.current.write(event.data)
          }
        }

        ws.onclose = () => {
          setIsConnected(false)
          if (xtermRef.current) {
            xtermRef.current.writeln("\x1b[31m\r\n✗ Connection closed\x1b[0m")
          }
        }

        ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          setError("WebSocket connection failed")
          setIsConnecting(false)
          setIsConnected(false)
        }

        // Handle terminal input
        xtermRef.current.onData((data) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(data)
          }
        })
      } catch (err) {
        console.error("Failed to create WebSocket:", err)
        setError("Failed to create WebSocket connection")
        setIsConnecting(false)
      }
    },
    [containerName, containerId]
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

      // Start the exec instance and connect via WebSocket
      connectWebSocket(execId)
    } catch (err) {
      console.error("Failed to connect to container:", err)
      setError(
        err instanceof Error ? err.message : "Failed to connect to container"
      )
      setIsConnecting(false)
    }
  }, [containerId, connectWebSocket])
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
      if (wsRef.current) {
        wsRef.current.close()
      }
      xterm.dispose()
    }
  }, [containerId, connectToContainer])

  const handleReconnect = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    connectToContainer()
  }

  const handleFitToWindow = () => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit()
    }
  }

  return (
    <div className="terminal-container">
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
