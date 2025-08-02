import { useDocker } from "../hooks/useDocker"
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
  } = useDocker()

  // Filter images based on search term
  const filteredImages = filterImages(images, searchTerm)

  const handleAction = async (action: string, imageId: string) => {
    switch (action) {
      case "remove":
        if (confirm("Are you sure you want to remove this image?")) {
          await removeImage(imageId)
        }
        break
      case "refresh":
        await refreshImages()
        break
    }
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
    </div>
  )
}
