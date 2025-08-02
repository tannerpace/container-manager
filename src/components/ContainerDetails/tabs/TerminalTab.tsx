import React, { useState } from "react"
import "./TerminalTab.css"

interface TerminalTabProps {
  containerId: string
}

export const TerminalTab: React.FC<TerminalTabProps> = ({ containerId }) => {
  const [isConnected, setIsConnected] = useState(false)

  const connectTerminal = () => {
    // This would implement actual terminal connection
    // For now, just show a placeholder
    setIsConnected(true)
  }

  if (!isConnected) {
    return (
      <div className="terminal-tab">
        <div className="terminal-placeholder">
          <div className="placeholder-content">
            <div className="placeholder-icon">💻</div>
            <h4>Terminal Access</h4>
            <p>
              Connect to the container's terminal to execute commands
              interactively.
            </p>
            <button onClick={connectTerminal} className="connect-btn">
              🔌 Connect Terminal
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="terminal-tab">
      <div className="terminal-header">
        <div className="terminal-tabs">
          <div className="terminal-tab-item active">
            <span>bash</span>
            <button className="close-tab">×</button>
          </div>
          <button className="new-tab-btn">+</button>
        </div>
        <div className="terminal-controls">
          <select className="shell-selector">
            <option value="/bin/bash">bash</option>
            <option value="/bin/sh">sh</option>
            <option value="/bin/zsh">zsh</option>
          </select>
        </div>
      </div>

      <div className="terminal-content">
        <div className="terminal-output">
          <div className="terminal-line">
            <span className="prompt">
              root@{containerId.substring(0, 12)}:/#
            </span>
            <span className="cursor">_</span>
          </div>
        </div>
      </div>

      <div className="terminal-footer">
        <span className="terminal-status">
          Connected to {containerId.substring(0, 12)}
        </span>
      </div>
    </div>
  )
}
