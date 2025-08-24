import React from "react"
import "./ContainerInspectModal.css"
import { InspectSection } from "./components/InspectSection"
import { useContainerDetails } from "./hooks/useContainerDetails"
import { useCopyToClipboard } from "./hooks/useCopyToClipboard"

interface ContainerInspectModalProps {
  containerId: string
  containerName: string
  isVisible: boolean
  onClose: () => void
}

export const ContainerInspectModal: React.FC<ContainerInspectModalProps> = ({
  containerId,
  containerName,
  isVisible,
  onClose,
}) => {
  const { containerDetails, loading, error, loadContainerDetails } = useContainerDetails(containerId, isVisible)
  const { copySuccess, copy } = useCopyToClipboard()

  if (!isVisible) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="inspect-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Container Inspect: {containerName}</h2>
          <div className="header-actions">
            <button
              className={`copy-button${copySuccess ? " success" : ""}`}
              onClick={() => containerDetails && copy(JSON.stringify(containerDetails, null, 2))}
              disabled={!containerDetails}
            >
              {copySuccess ? "✓ Copied!" : "📋 Copy JSON"}
            </button>
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading container details...</span>
            </div>
          )}

          {error && (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button onClick={loadContainerDetails} className="retry-button">
                Retry
              </button>
            </div>
          )}

          {containerDetails && (
            <div className="inspect-content">
              <InspectSection
                title="Basic Information"
                data={{
                  Id: containerDetails.Id,
                  Name: containerDetails.Name,
                  Created: containerDetails.Created,
                  Path: containerDetails.Path,
                  Args: containerDetails.Args,
                  Platform: containerDetails.Platform,
                  Driver: containerDetails.Driver,
                }}
                isRoot
              />
              <InspectSection title="State" data={containerDetails.State} />
              <InspectSection title="Image" data={containerDetails.Image} />
              <InspectSection title="Config" data={containerDetails.Config} />
              <InspectSection title="Host Config" data={containerDetails.HostConfig} />
              <InspectSection title="Network Settings" data={containerDetails.NetworkSettings} />
              <InspectSection title="Mounts" data={containerDetails.Mounts} />
              <InspectSection title="Graph Driver" data={containerDetails.GraphDriver} />

              {containerDetails.Config.Labels &&
                Object.keys(containerDetails.Config.Labels).length > 0 && (
                  <InspectSection title="Labels" data={containerDetails.Config.Labels} />
                )}

              {containerDetails.Config.Env &&
                containerDetails.Config.Env.length > 0 && (
                  <InspectSection title="Environment Variables" data={containerDetails.Config.Env} />
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
