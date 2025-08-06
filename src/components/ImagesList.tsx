import { useState } from "react"
import { useDocker } from "../hooks/useDocker"
import type { DockerImage } from "../types/dockerTypes"
import {
  ContainerCreateModal,
  type ContainerConfig,
} from "./ContainerCreateModal"
import "./ImagesList.css"

export function ImagesList() {
  const {
    images,
    loading,
    error,
    searchTerm,
    filterImages,
    removeImage,
    refreshImages,
    runContainer,
    createContainerWithConfig,
  } = useDocker()

  // Container creation modal state
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState<DockerImage | null>(null)

  // Filter images based on search term
  const filteredImages = filterImages(images, searchTerm)

  const handleAction = async (action: string, imageId: string) => {
    switch (action) {
      case "remove":
        if (confirm("Are you sure you want to remove this image?")) {
          await removeImage(imageId)
        }
        break
      case "run":
        try {
          await runContainer(imageId)
        } catch (error) {
          console.error("Error running container:", error)
          alert("Failed to create and run container from this image")
        }
        break
      case "create": {
        const image = images.find((img) => img.Id === imageId)
        if (image) {
          setSelectedImage(image)
          setCreateModalVisible(true)
        }
        break
      }
      case "refresh":
        await refreshImages()
        break
    }
  }

  const handleCreateContainer = async (config: ContainerConfig) => {
    try {
      await createContainerWithConfig(config)
      setCreateModalVisible(false)
      setSelectedImage(null)
    } catch (error) {
      console.error("Failed to create container:", error)
      // Error handling is done in the Docker context
    }
  }

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false)
    setSelectedImage(null)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading && images.length === 0) {
    return (
      <div className="images-loading">
        <div className="loading-spinner"></div>
        <p>Loading images...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="images-error">
        <h3>Error loading images</h3>
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
    <div className="images-list">
      <div className="images-header">
        <div className="header-content">
          <h2>Images ({filteredImages.length})</h2>
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

      {filteredImages.length === 0 && images.length > 0 ? (
        <div className="images-empty">
          <div className="empty-icon">🔍</div>
          <h3>No images match your search</h3>
          <p>
            Try adjusting your search term or clear the search to see all
            images.
          </p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💿</div>
          <h3>No images found</h3>
          <p>Pull an image to get started</p>
        </div>
      ) : (
        <div className="images-table">
          <div className="table-header">
            <div className="col-repository">Repository</div>
            <div className="col-tag">Tag</div>
            <div className="col-id">Image ID</div>
            <div className="col-created">Created</div>
            <div className="col-size">Size</div>
            <div className="col-actions">Actions</div>
          </div>

          {filteredImages.map((image) => (
            <div key={image.Id} className="table-row">
              <div className="col-repository">
                <div className="image-repo">
                  {image.RepoTags?.[0]?.split(":")[0] || "none"}
                </div>
              </div>

              <div className="col-tag">
                <span className="image-tag">
                  {image.RepoTags?.[0]?.split(":")[1] || "none"}
                </span>
              </div>

              <div className="col-id">
                <span className="image-id">
                  {image.Id.replace("sha256:", "").substring(0, 12)}
                </span>
              </div>

              <div className="col-created">
                {new Date(image.Created * 1000).toLocaleDateString()}
              </div>

              <div className="col-size">
                <span className="image-size">{formatBytes(image.Size)}</span>
              </div>

              <div className="col-actions">
                <div className="action-buttons">
                  <button
                    onClick={() => handleAction("run", image.Id)}
                    className="action-btn run-btn"
                    data-tooltip="Run container"
                  >
                    ▶️
                  </button>
                  <button
                    onClick={() => handleAction("create", image.Id)}
                    className="action-btn create-btn"
                    data-tooltip="Create container with custom settings"
                  >
                    ⚙️
                  </button>
                  <button
                    onClick={() => handleAction("remove", image.Id)}
                    className="action-btn remove-btn"
                    data-tooltip="Remove image"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {createModalVisible && selectedImage && (
        <ContainerCreateModal
          isOpen={createModalVisible}
          onClose={handleCloseCreateModal}
          onCreateContainer={handleCreateContainer}
          sourceImage={selectedImage}
          mode="create"
        />
      )}
    </div>
  )
}
