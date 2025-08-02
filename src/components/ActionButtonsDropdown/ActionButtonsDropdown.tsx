import React, { useEffect, useRef, useState } from "react"
import { dockerTerminalActions } from "../../utils/terminalUtils"
import "./ActionButtonsDropdown.css"

interface DockerContainer {
  Id: string
  Names: string[]
  Image: string
  ImageID: string
  Command: string
  Created: number
  Ports: any[]
  Labels: Record<string, string>
  State: string
  Status: string
  HostConfig: {
    NetworkMode: string
  }
  NetworkSettings: {
    Networks: Record<string, any>
  }
  Mounts: any[]
}

interface ActionButtonsDropdownProps {
  container: DockerContainer
  onAction: (action: string, containerId: string) => void
}

export const ActionButtonsDropdown: React.FC<ActionButtonsDropdownProps> = ({
  container,
  onAction,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const containerId = container.Id
  const containerName = container.Names[0]?.replace(/^\//, "") || "Unknown"
  const status = container.State

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleAction = (action: string) => {
    onAction(action, containerId)
    setIsOpen(false)
  }

  const isRunning = status.toLowerCase() === "running"
  const isStopped =
    status.toLowerCase() === "exited" || status.toLowerCase() === "stopped"

  return (
    <div className="action-buttons-dropdown" ref={dropdownRef}>
      <button
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Container actions"
      >
        ⋮
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <strong>{containerName}</strong>
            <span className={`status-badge ${status.toLowerCase()}`}>
              {status}
            </span>
          </div>

          <div className="dropdown-actions">
            {/* Start/Stop actions */}
            {isStopped && (
              <button
                className="dropdown-action start"
                onClick={() => handleAction("start")}
              >
                ▶️ Start
              </button>
            )}

            {isRunning && (
              <>
                <button
                  className="dropdown-action stop"
                  onClick={() => handleAction("stop")}
                >
                  ⏹️ Stop
                </button>
                <button
                  className="dropdown-action restart"
                  onClick={() => handleAction("restart")}
                >
                  🔄 Restart
                </button>
                <button
                  className="dropdown-action pause"
                  onClick={() => handleAction("pause")}
                >
                  ⏸️ Pause
                </button>
              </>
            )}

            {status.toLowerCase() === "paused" && (
              <button
                className="dropdown-action unpause"
                onClick={() => handleAction("unpause")}
              >
                ▶️ Unpause
              </button>
            )}

            {/* Information actions */}
            <div className="dropdown-divider" />

            <button
              className="dropdown-action logs"
              onClick={() => handleAction("logs")}
            >
              📄 View Logs
            </button>

            {isRunning && (
              <>
                <button
                  className="dropdown-action terminal"
                  onClick={() => handleAction("terminal")}
                >
                  💻 Web Terminal
                </button>
                <button
                  className="dropdown-action mac-terminal"
                  onClick={() => {
                    dockerTerminalActions.shell(containerId, containerName)
                    setIsOpen(false)
                  }}
                >
                  🖥️ macOS Terminal
                </button>
              </>
            )}

            <button
              className="dropdown-action inspect"
              onClick={() => handleAction("inspect")}
            >
              🔍 Inspect
            </button>

            <button
              className="dropdown-action terminal-logs"
              onClick={() => {
                dockerTerminalActions.logs(containerId, containerName)
                setIsOpen(false)
              }}
            >
              📊 Logs in Terminal
            </button>

            {isRunning && (
              <button
                className="dropdown-action terminal-stats"
                onClick={() => {
                  dockerTerminalActions.stats(containerId, containerName)
                  setIsOpen(false)
                }}
              >
                📈 Stats in Terminal
              </button>
            )}

            {/* Dangerous actions */}
            <div className="dropdown-divider" />

            <button
              className="dropdown-action remove"
              onClick={() => handleAction("remove")}
              disabled={isRunning}
            >
              🗑️ Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
