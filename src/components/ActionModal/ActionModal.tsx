import React, { useEffect, useRef } from "react"
import type { DockerContainer } from "../../types/dockerTypes"
import { dockerTerminalActions } from "../../utils/terminalUtils"
import "./ActionModal.css"

interface ActionModalProps {
  container: DockerContainer | null
  isOpen: boolean
  position: { x: number; y: number }
  onAction: (action: string, containerId: string) => void
  onClose: () => void
}

export const ActionModal: React.FC<ActionModalProps> = ({
  container,
  isOpen,
  position,
  onAction,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !container) {
    return null
  }

  const containerId = container.Id
  const containerName = container.Names[0]?.replace(/^\//, "") || "Unknown"
  const status = container.State

  const handleAction = (action: string) => {
    onAction(action, containerId)
    onClose()
  }

  const isRunning = status.toLowerCase() === "running"
  const isStopped =
    status.toLowerCase() === "exited" || status.toLowerCase() === "stopped"
  const isPaused = status.toLowerCase() === "paused"

  return (
    <>
      {/* Backdrop */}
      <div className="action-modal-backdrop" onClick={onClose} />

      {/* Modal */}
      <div
        className="action-modal"
        ref={modalRef}
        style={{
          position: "fixed",
          left: Math.max(10, Math.min(position.x, window.innerWidth - 220)),
          top: Math.max(10, Math.min(position.y, window.innerHeight - 400)),
          zIndex: 10000,
        }}
      >
        <div className="action-modal-header">
          <strong>{containerName}</strong>
          <span className={`status-badge ${status.toLowerCase()}`}>
            {status}
          </span>
        </div>

        <div className="action-modal-actions">
          {/* Start/Stop actions */}
          {isStopped && (
            <button
              className="action-item start"
              onClick={() => handleAction("start")}
            >
              <span className="action-icon">▶️</span>
              <span className="action-text">Start</span>
            </button>
          )}

          {isRunning && (
            <>
              <button
                className="action-item stop"
                onClick={() => handleAction("stop")}
              >
                <span className="action-icon">⏹️</span>
                <span className="action-text">Stop</span>
              </button>
              <button
                className="action-item restart"
                onClick={() => handleAction("restart")}
              >
                <span className="action-icon">🔄</span>
                <span className="action-text">Restart</span>
              </button>
              <button
                className="action-item pause"
                onClick={() => handleAction("pause")}
              >
                <span className="action-icon">⏸️</span>
                <span className="action-text">Pause</span>
              </button>
            </>
          )}

          {isPaused && (
            <button
              className="action-item unpause"
              onClick={() => handleAction("unpause")}
            >
              <span className="action-icon">▶️</span>
              <span className="action-text">Unpause</span>
            </button>
          )}

          {/* Information actions */}
          <div className="action-divider" />

          <button
            className="action-item logs"
            onClick={() => handleAction("logs")}
          >
            <span className="action-icon">📄</span>
            <span className="action-text">View Logs</span>
          </button>

          {isRunning && (
            <>
              <button
                className="action-item terminal"
                onClick={() => handleAction("terminal")}
              >
                <span className="action-icon">💻</span>
                <span className="action-text">Web Terminal</span>
              </button>
              <button
                className="action-item mac-terminal"
                onClick={() => {
                  dockerTerminalActions.shell(containerId, containerName)
                  onClose()
                }}
              >
                <span className="action-icon">🖥️</span>
                <span className="action-text">macOS Terminal</span>
              </button>
            </>
          )}

          <button
            className="action-item inspect"
            onClick={() => handleAction("inspect")}
          >
            <span className="action-icon">🔍</span>
            <span className="action-text">Inspect</span>
          </button>

          <button
            className="action-item terminal-logs"
            onClick={() => {
              dockerTerminalActions.logs(containerId, containerName)
              onClose()
            }}
          >
            <span className="action-icon">📊</span>
            <span className="action-text">Logs in Terminal</span>
          </button>

          {isRunning && (
            <button
              className="action-item terminal-stats"
              onClick={() => {
                dockerTerminalActions.stats(containerId, containerName)
                onClose()
              }}
            >
              <span className="action-icon">📈</span>
              <span className="action-text">Stats in Terminal</span>
            </button>
          )}

          {/* Management actions */}
          <div className="action-divider" />

          <button
            className="action-item rename"
            onClick={() => handleAction("rename")}
          >
            <span className="action-icon">✏️</span>
            <span className="action-text">Rename</span>
          </button>

          <button
            className="action-item export"
            onClick={() => handleAction("export")}
          >
            <span className="action-icon">📦</span>
            <span className="action-text">Export</span>
          </button>

          <button
            className="action-item copy"
            onClick={() => handleAction("copy")}
          >
            <span className="action-icon">📋</span>
            <span className="action-text">Copy</span>
          </button>

          {/* Dangerous actions */}
          <div className="action-divider" />

          <button
            className="action-item remove"
            onClick={() => handleAction("remove")}
            disabled={isRunning}
          >
            <span className="action-icon">🗑️</span>
            <span className="action-text">Remove</span>
          </button>
        </div>
      </div>
    </>
  )
}
