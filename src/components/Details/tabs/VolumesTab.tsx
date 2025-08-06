import React from "react"
import type { DockerContainerDetails } from "../../../types/docker"
import "./VolumesTab.css"

interface VolumesTabProps {
  container: DockerContainerDetails
}

export const VolumesTab: React.FC<VolumesTabProps> = ({ container }) => {
  const mounts = container.Mounts || []

  if (mounts.length === 0) {
    return (
      <div className="volumes-tab">
        <div className="empty-state">
          <div className="empty-icon">💾</div>
          <h4>No Volume Mounts</h4>
          <p>This container has no volumes or bind mounts configured.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="volumes-tab">
      <div className="tab-section">
        <h3 className="section-title">Volume Mounts ({mounts.length})</h3>
        <div className="mounts-grid">
          {mounts.map((mount, index) => (
            <div key={index} className="mount-card">
              <div className="mount-header">
                <h4 className="mount-type">{mount.Type}</h4>
                <span
                  className={`mount-mode ${
                    mount.RW ? "read-write" : "read-only"
                  }`}
                >
                  {mount.RW ? "Read/Write" : "Read Only"}
                </span>
              </div>

              <div className="mount-details">
                <div className="info-row">
                  <span className="info-label">Source:</span>
                  <span className="info-value code">{mount.Source}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Destination:</span>
                  <span className="info-value code">{mount.Destination}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Mode:</span>
                  <span className="info-value">{mount.Mode}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Propagation:</span>
                  <span className="info-value">{mount.Propagation}</span>
                </div>
                {mount.Name && (
                  <div className="info-row">
                    <span className="info-label">Name:</span>
                    <span className="info-value">{mount.Name}</span>
                  </div>
                )}
                {mount.Driver && (
                  <div className="info-row">
                    <span className="info-label">Driver:</span>
                    <span className="info-value">{mount.Driver}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
