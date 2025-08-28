import { useDocker } from '../../hooks/useDocker';
import type { DockerVolume } from '../../types/dockerTypes';

import './VolumesList.css';
interface VolumesListProps {
  onVolumeSelect?: (volumeName: string) => void
}

export function VolumesList({ onVolumeSelect }: VolumesListProps = {}) {
  const { volumes, loading, error, searchTerm, filterVolumes, refreshVolumes } =
    useDocker()

  // Filter volumes based on search term
  const filteredVolumes = filterVolumes(volumes, searchTerm)

  const handleRefresh = async () => {
    await refreshVolumes()
  }

  if (loading && volumes.length === 0) {
    return (
      <div className="volumes-loading">
        <div className="loading-spinner"></div>
        <p>Loading volumes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="volumes-error">
        <h3>Error loading volumes</h3>
        <p>{error}</p>
        <button
          onClick={handleRefresh}
          className="retry-btn"
          data-tooltip="Retry loading volumes"
        >
          Retry
        </button>
      </div>
    )
  }

  let content: React.ReactNode
  if (filteredVolumes.length === 0 && volumes.length > 0) {
    content = (
      <div className="volumes-empty">
        <div className="empty-icon">🔍</div>
        <h3>No volumes match your search</h3>
        <p>
          Try adjusting your search term or clear the search to see all
          volumes.
        </p>
      </div>
    )
  } else if (filteredVolumes.length === 0) {
    content = (
      <div className="empty-state">
        <div className="empty-icon">💾</div>
        <h3>No volumes found</h3>
        <p>Create a volume to persist data</p>
      </div>
    )
  } else {
    content = (
			<div className="volumes-table">
				<div className="table-header">
					<div className="col-name">Volume Name</div>
					<div className="col-driver">Driver</div>
					<div className="col-mountpoint">Mount Point</div>
					<div className="col-created">Created</div>
					<div className="col-actions">Actions</div>
				</div>
				{filteredVolumes.map((volume: DockerVolume) => (
					<div
						key={volume.Name}
						className="table-row"
						onClick={() => onVolumeSelect && onVolumeSelect(volume.Name)}
						style={{ cursor: onVolumeSelect ? "pointer" : undefined } as React.CSSProperties}
					>
						<div className="col-name">
							<div className="volume-name">{volume.Name}</div>
						</div>
						<div className="col-driver">
							<span className="volume-driver">{volume.Driver}</span>
						</div>
						<div className="col-mountpoint">
							<span className="mountpoint">{volume.Mountpoint}</span>
						</div>
						<div className="col-created">
							{new Date(volume.CreatedAt).toLocaleDateString()}
						</div>
						<div className="col-actions">
							<div className="action-buttons">
								<button
									className="action-btn remove-btn"
									data-tooltip="Remove volume"
								>
									🗑️
								</button>
							</div>
						</div>
					</div>
				))}
			</div>
    )
  }

  return (
    <div className="volumes-list">
      {content}
    </div>
  )
}
