import { useEffect, useState } from 'react';
import { useDocker } from '../../hooks/useDocker';
import type { DockerVolume } from '../../types/dockerTypes';
import './VolumeDetails.css';

interface VolumeDetailsProps {
  volumeName: string;
  onClose: () => void;
}

export const VolumeDetails = ({ volumeName, onClose }: VolumeDetailsProps) => {
  const { volumes, loading, error, refreshVolumes } = useDocker();
  const [volumeDetails, setVolumeDetails] = useState<DockerVolume | null>(null);

  useEffect(() => {
    // Find the volume from the existing volumes data
    const volume = volumes.find(v => v.Name === volumeName);
    if (volume) {
      setVolumeDetails(volume);
    } else if (!loading && volumes.length > 0) {
      // Volume not found, might need to refresh
      refreshVolumes();
    }
  }, [volumeName, volumes, loading, refreshVolumes]);

  if (loading) {
    return (
      <div className="volume-details-modal">
        <div className="modal-header">
          <h2>Volume Details: {volumeName}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <div className="loading-spinner"></div>
          <p>Loading volume details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="volume-details-modal">
        <div className="modal-header">
          <h2>Volume Details: {volumeName}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <div className="error-message">
            <h3>Error loading volume details</h3>
            <p>{error}</p>
            <button onClick={refreshVolumes} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!volumeDetails) {
    return (
      <div className="volume-details-modal">
        <div className="modal-header">
          <h2>Volume Details: {volumeName}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <div className="error-message">
            <h3>Volume not found</h3>
            <p>The volume "{volumeName}" could not be found.</p>
            <button onClick={refreshVolumes} className="retry-btn">
              Refresh Volumes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="volume-details-modal">
      <div className="modal-header">
        <h2>Volume Details: {volumeDetails.Name}</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="modal-content">
        <div className="volume-info-grid">
          <div className="info-row">
            <span className="label">Name:</span>
            <span className="value">{volumeDetails.Name}</span>
          </div>
          <div className="info-row">
            <span className="label">Driver:</span>
            <span className="value">{volumeDetails.Driver}</span>
          </div>
          <div className="info-row">
            <span className="label">Mount Point:</span>
            <span className="value">{volumeDetails.Mountpoint}</span>
          </div>
          <div className="info-row">
            <span className="label">Scope:</span>
            <span className="value">{volumeDetails.Scope}</span>
          </div>
          <div className="info-row">
            <span className="label">Created:</span>
            <span className="value">{new Date(volumeDetails.CreatedAt).toLocaleString()}</span>
          </div>
          {volumeDetails.Labels && Object.keys(volumeDetails.Labels).length > 0 && (
            <div className="info-row">
              <span className="label">Labels:</span>
              <div className="labels-container">
                {Object.entries(volumeDetails.Labels).map(([key, value]) => (
                  <span key={key} className="label-item">
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          )}
          {volumeDetails.Options && Object.keys(volumeDetails.Options).length > 0 && (
            <div className="info-row">
              <span className="label">Options:</span>
              <div className="options-container">
                {Object.entries(volumeDetails.Options).map(([key, value]) => (
                  <span key={key} className="option-item">
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
