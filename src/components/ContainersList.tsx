import { useState } from "react"
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
    restartContainer,
    pauseContainer,
    unpauseContainer,
    renameContainer,
    exportContainer,
    removeContainer,
    refreshContainers,
  } = useDocker()

  const [renameModalVisible, setRenameModalVisible] = useState(false)
  const [currentContainer, setCurrentContainer] = useState<string | null>(null)
  const [newContainerName, setNewContainerName] = useState("")

  const handleAction = async (action: string, containerId: string) => {
    switch (action) {
      case "start":
        await startContainer(containerId)
        break
      case "stop":
        await stopContainer(containerId)
        break
      case "restart":
        await restartContainer(containerId)
        break
      case "pause":
        await pauseContainer(containerId)
        break
      case "unpause":
        await unpauseContainer(containerId)
        break
      case "rename": {
        setCurrentContainer(containerId)
        const container = containers.find((c) => c.Id === containerId)
        setNewContainerName(container?.Names[0]?.replace("/", "") || "")
        setRenameModalVisible(true)
        break
      }
      case "export":
        if (confirm("Export this container as an image?")) {
          await exportContainer(containerId)
        }
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

  const handleRename = async () => {
    if (currentContainer && newContainerName.trim()) {
      await renameContainer(currentContainer, newContainerName.trim())
      setRenameModalVisible(false)
      setCurrentContainer(null)
      setNewContainerName("")
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
              data-tooltip="Refresh containers list"
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
                    data-tooltip="View details"
                  >
                    📋
                  </button>

                  {container.State === "running" ? (
                    <>
                      <button
                        onClick={() => handleAction("stop", container.Id)}
                        className="action-btn stop-btn"
                        data-tooltip="Stop container"
                      >
                        ⏹️
                      </button>
                      <button
                        onClick={() => handleAction("restart", container.Id)}
                        className="action-btn restart-btn"
                        data-tooltip="Restart container"
                      >
                        🔄
                      </button>
                      <button
                        onClick={() => handleAction("pause", container.Id)}
                        className="action-btn pause-btn"
                        data-tooltip="Pause container"
                      >
                        ⏸️
                      </button>
                    </>
                  ) : container.State === "paused" ? (
                    <>
                      <button
                        onClick={() => handleAction("unpause", container.Id)}
                        className="action-btn unpause-btn"
                        data-tooltip="Unpause container"
                      >
                        ▶️
                      </button>
                      <button
                        onClick={() => handleAction("stop", container.Id)}
                        className="action-btn stop-btn"
                        data-tooltip="Stop container"
                      >
                        ⏹️
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleAction("start", container.Id)}
                      className="action-btn start-btn"
                      data-tooltip="Start container"
                    >
                      ▶️
                    </button>
                  )}

                  <button
                    onClick={() => handleAction("rename", container.Id)}
                    className="action-btn rename-btn"
                    data-tooltip="Rename container"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => handleAction("export", container.Id)}
                    className="action-btn export-btn"
                    data-tooltip="Export as image"
                  >
                    📦
                  </button>

                  <button
                    onClick={() => handleAction("remove", container.Id)}
                    className="action-btn remove-btn"
                    data-tooltip="Remove container"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rename Modal */}
      {renameModalVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Rename Container</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setRenameModalVisible(false)
                  setCurrentContainer(null)
                  setNewContainerName("")
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <label htmlFor="container-name">New container name:</label>
              <input
                id="container-name"
                type="text"
                value={newContainerName}
                onChange={(e) => setNewContainerName(e.target.value)}
                placeholder="Enter new container name"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setRenameModalVisible(false)
                  setCurrentContainer(null)
                  setNewContainerName("")
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRename}
                disabled={!newContainerName.trim()}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
