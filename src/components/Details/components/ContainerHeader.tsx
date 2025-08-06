import React from "react"
import type { DockerContainerDetails } from "../../../types/docker"
import "./ContainerHeader.css"

interface ContainerHeaderProps {
  container: DockerContainerDetails
  onAction: (action: string) => void
  onClose: () => void
}

export const ContainerHeader: React.FC<ContainerHeaderProps> = ({
  container,
  onAction,
  onClose,
}) => {
  const getStatusColor = (state: string, running: boolean) => {
    if (running) return "#28a745"
    if (state === "exited") return "#dc3545"
    if (state === "paused") return "#ffc107"
    return "#6c757d"
  }

  const getStatusText = (container: DockerContainerDetails) => {
    if (container.State.Running) return "Running"
    if (container.State.Paused) return "Paused"
    if (container.State.Restarting) return "Restarting"
    if (container.State.Dead) return "Dead"
    return "Stopped"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const statusText = getStatusText(container)
  const statusColor = getStatusColor(
    container.State.Status,
    container.State.Running
  )

  return (
    <div className="container-header">
      <div className="header-main">
        <div className="container-info">
          <div className="container-name-row">
            <h1 className="container-name">
              {container.Name.replace("/", "")}
            </h1>
            <div className="container-status">
              <span
                className="status-dot"
                style={{ backgroundColor: statusColor }}
              ></span>
              <span className="status-text">{statusText}</span>
            </div>
          </div>

          <div className="container-meta">
            <span className="container-id" title={container.Id}>
              {container.Id.substring(0, 12)}
            </span>
            <span className="container-image">{container.Config.Image}</span>
            <span className="container-created">
              Created {formatDate(container.Created)}
            </span>
          </div>
        </div>

        <div className="header-actions">
          {/* Running container actions */}
          {container.State.Running && (
            <>
              <button
                onClick={() => onAction("pause")}
                className="action-btn pause-btn"
                title="Pause container"
              >
                ⏸️ Pause
              </button>
              <button
                onClick={() => onAction("restart")}
                className="action-btn restart-btn"
                title="Restart container"
              >
                🔄 Restart
              </button>
              <button
                onClick={() => onAction("stop")}
                className="action-btn stop-btn"
                title="Stop container"
              >
                ⏹️ Stop
              </button>
            </>
          )}

          {/* Paused container actions */}
          {container.State.Paused && (
            <>
              <button
                onClick={() => onAction("unpause")}
                className="action-btn start-btn"
                title="Unpause container"
              >
                ▶️ Unpause
              </button>
              <button
                onClick={() => onAction("stop")}
                className="action-btn stop-btn"
                title="Stop container"
              >
                ⏹️ Stop
              </button>
            </>
          )}

          {/* Stopped container actions */}
          {!container.State.Running && !container.State.Paused && (
            <>
              <button
                onClick={() => onAction("start")}
                className="action-btn start-btn"
                title="Start container"
              >
                ▶️ Start
              </button>
              <button
                onClick={() => onAction("remove")}
                className="action-btn remove-btn"
                title="Remove container"
              >
                🗑️ Remove
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="action-btn close-btn"
            title="Close details"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="quick-info">
        <div className="info-item">
          <span className="info-label">Uptime:</span>
          <span className="info-value">
            {container.State.Running && container.State.StartedAt
              ? formatUptime(container.State.StartedAt)
              : "Not running"}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">Restart Count:</span>
          <span className="info-value">{container.RestartCount}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Platform:</span>
          <span className="info-value">{container.Platform}</span>
        </div>

        {container.State.ExitCode !== 0 && !container.State.Running && (
          <div className="info-item error">
            <span className="info-label">Exit Code:</span>
            <span className="info-value">{container.State.ExitCode}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to format uptime
function formatUptime(startedAt: string): string {
  const start = new Date(startedAt)
  const now = new Date()
  const diff = now.getTime() - start.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}
