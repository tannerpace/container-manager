import { useDocker } from "../context/DockerContext"
import "./ContainersList.css"

interface ContainersListProps {
  onContainerSelect?: (containerId: string) => void
}

export function ContainersList({ onContainerSelect }: ContainersListProps) {
  const {
    containers,
    loading,
    error,
    startContainer,
    stopContainer,
    removeContainer,
    refreshContainers,
  } = useDocker()

  const handleAction = async (action: string, containerId: string) => {
    switch (action) {
      case "start":
        await startContainer(containerId)
        break
      case "stop":
        await stopContainer(containerId)
        break
      case "remove":
        if (confirm("Are you sure you want to remove this container?")) {
          await removeContainer(containerId)
        }
        break
      case "refresh":
        await refreshContainers()
        break
    }
  }

  const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "running":
        return "#28a745"
      case "exited":
        return "#dc3545"
      case "paused":
        return "#ffc107"
      default:
        return "#6c757d"
    }
  }

  if (loading && containers.length === 0) {
    return (
      <div className="containers-loading">
        <div className="loading-spinner"></div>
        <p>Loading containers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="containers-error">
        <h3>Error loading containers</h3>
        <p>{error}</p>
        <button
          onClick={() => handleAction("refresh", "")}
          className="retry-btn"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="containers-list">
      <div className="containers-header">
        <div className="header-content">
          <h2>Containers ({containers.length})</h2>
          <div className="header-actions">
            <button
              onClick={() => handleAction("refresh", "")}
              className="refresh-btn"
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {containers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No containers found</h3>
          <p>Create a new container to get started</p>
        </div>
      ) : (
        <div className="containers-table">
          <div className="table-header">
            <div className="col-name">Name</div>
            <div className="col-image">Image</div>
            <div className="col-status">Status</div>
            <div className="col-ports">Ports</div>
            <div className="col-created">Created</div>
            <div className="col-actions">Actions</div>
          </div>

          {containers.map((container) => (
            <div key={container.Id} className="table-row">
              <div className="col-name">
                <div className="container-name">
                  {container.Names[0]?.replace("/", "") || "unnamed"}
                </div>
                <div className="container-id">
                  {container.Id.substring(0, 12)}
                </div>
              </div>

              <div className="col-image">
                <span className="image-name">{container.Image}</span>
              </div>

              <div className="col-status">
                <div className="status-badge">
                  <div
                    className="status-dot"
                    style={{ backgroundColor: getStatusColor(container.State) }}
                  ></div>
                  <span>{container.State}</span>
                </div>
                <div className="status-detail">{container.Status}</div>
              </div>

              <div className="col-ports">
                {container.Ports.length > 0 ? (
                  <div className="ports-list">
                    {container.Ports.map((port, index) => (
                      <div key={index} className="port-mapping">
                        {port.PublicPort
                          ? `${port.PublicPort}:${port.PrivatePort}`
                          : port.PrivatePort}
                        <span className="port-type">/{port.Type}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="no-ports">-</span>
                )}
              </div>

              <div className="col-created">
                {new Date(container.Created * 1000).toLocaleDateString()}
              </div>

              <div className="col-actions">
                <div className="action-buttons">
                  <button
                    onClick={() => onContainerSelect?.(container.Id)}
                    className="action-btn details-btn"
                    title="View details"
                  >
                    📋
                  </button>

                  {container.State === "running" ? (
                    <button
                      onClick={() => handleAction("stop", container.Id)}
                      className="action-btn stop-btn"
                      title="Stop container"
                    >
                      ⏹️
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction("start", container.Id)}
                      className="action-btn start-btn"
                      title="Start container"
                    >
                      ▶️
                    </button>
                  )}

                  <button
                    onClick={() => handleAction("remove", container.Id)}
                    className="action-btn remove-btn"
                    title="Remove container"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
