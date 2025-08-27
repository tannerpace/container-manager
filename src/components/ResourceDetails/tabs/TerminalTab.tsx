import React, { useState } from "react"
import { Terminal } from "../../Terminal/Terminal"
import "./TerminalTab.css"

interface TerminalTabProps {
  containerId: string
  containerName?: string
}

export const TerminalTab: React.FC<TerminalTabProps> = ({
  containerId,
  containerName,
}) => {
  const [isTerminalActive, setIsTerminalActive] = useState(false)
  const [terminals, setTerminals] = useState<
    Array<{ id: string; shell: string }>
  >([])
  const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null)

  const startNewTerminal = (shell: string = "/bin/bash") => {
    const terminalId = `terminal-${Date.now()}`
    const newTerminal = { id: terminalId, shell }

    setTerminals((prev) => [...prev, newTerminal])
    setActiveTerminalId(terminalId)
    setIsTerminalActive(true)
  }

  const closeTerminal = (terminalIdToClose?: string) => {
    const targetId = terminalIdToClose || activeTerminalId
    if (!targetId) return

    setTerminals((prev) => prev.filter((t) => t.id !== targetId))

    // If we're closing the active terminal, switch to another one or close all
    if (targetId === activeTerminalId) {
      const remainingTerminals = terminals.filter((t) => t.id !== targetId)
      if (remainingTerminals.length > 0) {
        setActiveTerminalId(remainingTerminals[0].id)
      } else {
        setActiveTerminalId(null)
        setIsTerminalActive(false)
      }
    }
  }

  const switchToTerminal = (terminalId: string) => {
    setActiveTerminalId(terminalId)
  }

  if (!isTerminalActive || terminals.length === 0) {
    return (
      <div className="terminal-tab">
        <div className="terminal-placeholder">
          <div className="placeholder-content">
            <div className="placeholder-icon">💻</div>
            <h4>Terminal Access</h4>
            <p>
              Connect to the container's terminal to execute commands
              interactively. Choose your preferred shell to get started.
            </p>
            <div className="shell-options">
              <button
                onClick={() => startNewTerminal("/bin/bash")}
                className="connect-btn shell-btn"
              >
                🐚 Start Bash
              </button>
              <button
                onClick={() => startNewTerminal("/bin/sh")}
                className="connect-btn shell-btn"
              >
                � Start Shell
              </button>
              <button
                onClick={() => startNewTerminal("/bin/zsh")}
                className="connect-btn shell-btn"
              >
                ⚡ Start Zsh
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const activeTerminal = terminals.find((t) => t.id === activeTerminalId)

  return (
    <div className="terminal-tab">
      <div className="terminal-header">
        <div className="terminal-tabs">
          {terminals.map((terminal) => (
            <div
              key={terminal.id}
              className={`terminal-tab-item ${
                terminal.id === activeTerminalId ? "active" : ""
              }`}
              onClick={() => switchToTerminal(terminal.id)}
            >
              <span>{terminal.shell.split("/").pop()}</span>
              <button
                className="close-tab"
                onClick={(e) => {
                  e.stopPropagation()
                  closeTerminal(terminal.id)
                }}
              >
                ×
              </button>
            </div>
          ))}
          <div className="terminal-controls">
            <select
              className="shell-selector"
              onChange={(e) => {
                if (e.target.value) {
                  startNewTerminal(e.target.value)
                  e.target.value = "" // Reset selector
                }
              }}
              value=""
            >
              <option value="">+ New Terminal</option>
              <option value="/bin/bash">bash</option>
              <option value="/bin/sh">sh</option>
              <option value="/bin/zsh">zsh</option>
            </select>
          </div>
        </div>
      </div>

      <div className="terminal-content">
        {activeTerminal && (
          <Terminal
            containerId={containerId}
            containerName={containerName}
            onClose={() => closeTerminal(activeTerminal.id)}
            showHeader={false} // We're handling the header ourselves
            embedded={true} // Enable embedded mode
          />
        )}
      </div>

      <div className="terminal-footer">
        <span className="terminal-status">
          Connected to {containerName || containerId.substring(0, 12)}
          {activeTerminal && ` • ${activeTerminal.shell.split("/").pop()}`}
        </span>
      </div>
    </div>
  )
}
