import { useImageComponent } from '../hooks/useImageComponent'
import type { DockerImage } from "../types/dockerTypes"
import {
	ContainerCreateModal
} from "./ContainerCreateModal"
import { ImageRow } from "./ImageRow"
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
    handleSelectImage,
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
          handleSelectImage={handleSelectImage}
          selectedImage={selectedImage}
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
function ImagesTable({ images, handleAction, formatBytes, handleSelectImage, selectedImage }: {
	images: DockerImage[]
	handleAction: (action: string, imageId: string) => void
	formatBytes: (bytes: number) => string
	handleSelectImage: (image: DockerImage) => void
	selectedImage: DockerImage | null
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
        <ImageRow
          key={image.Id}
          image={image}
          isSelected={!!selectedImage && selectedImage.Id === image.Id}
          handleSelectImage={handleSelectImage}
          handleAction={handleAction}
          formatBytes={formatBytes}
        />
      ))}
    </div>
  )
}
}
