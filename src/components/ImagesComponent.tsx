import { useImageComponent } from '../hooks/useImageComponent'
import type { DockerImage } from "../types/dockerTypes"
import {
	ContainerCreateModal
} from "./ContainerCreateModal"
import "./ImagesComponent.css"

export function ImagesComponent() {
const {
		images,
		loading,
		error,
		createModalVisible,
		selectedImage,
		filteredImages,
		isAllFiltered,
		handleAction,
		handleCreateContainer,
		handleCloseCreateModal,
		formatBytes,
	} = useImageComponent()

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

      {/* Show 'No images match your search' if all filtered */}
      {isAllFiltered && (
        <div className="images-empty">
          <div className="empty-icon">🔍</div>
          <h3>No images match your search</h3>
          <p>
            Try adjusting your search term or clear the search to see all
            images.
          </p>
        </div>
      )}

      {/* Show 'No images found' if there are no images at all */}
      {filteredImages.length === 0 && images.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💿</div>
          <h3>No images found</h3>
          <p>Pull an image to get started</p>
        </div>
      )}

      {/* Show images table if there are filtered images */}
      {filteredImages.length > 0 && (
        <ImagesTable
          images={filteredImages}
          handleAction={handleAction}
          formatBytes={formatBytes}
        />
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


/**
 * Table component for displaying Docker images
 */
function ImagesTable({ images, handleAction, formatBytes }: {
  images: DockerImage[]
  handleAction: (action: string, imageId: string) => void
  formatBytes: (bytes: number) => string
}) {
  return (
    <div className="images-table">
      <div className="table-header">
        <div className="col-repository">Repository</div>
        <div className="col-tag">Tag</div>
        <div className="col-id">Image ID</div>
        <div className="col-created">Created</div>
        <div className="col-size">Size</div>
        <div className="col-actions">Actions</div>
      </div>

      {images.map((image) => (
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
							hi
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
}
