import React, { useEffect, useState } from "react"
import { dockerAPI } from "../../api/dockerClient"
import type { DockerContainerDetails } from "../../types/dockerTypes"
import "./ContainerInspectModal.css"

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
  const [containerDetails, setContainerDetails] =
    useState<DockerContainerDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    const loadDetails = async () => {
      if (isVisible && containerId) {
        try {
          setLoading(true)
          setError(null)
          const details = await dockerAPI.inspectContainer(containerId)
          setContainerDetails(details)
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load container details"
          )
        } finally {
          setLoading(false)
        }
      }
    }

    loadDetails()
  }, [isVisible, containerId])

  const loadContainerDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const details = await dockerAPI.inspectContainer(containerId)
      setContainerDetails(details)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load container details"
      )
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (containerDetails) {
      try {
        await navigator.clipboard.writeText(
          JSON.stringify(containerDetails, null, 2)
        )
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err) {
        console.error("Failed to copy to clipboard:", err)
      }
    }
  }

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return "null"
    }
    if (typeof value === "boolean") {
      return value.toString()
    }
    if (typeof value === "string") {
      return value || '""'
    }
    if (typeof value === "number") {
      return value.toString()
    }
    if (Array.isArray(value)) {
      return value.length === 0 ? "[]" : JSON.stringify(value, null, 2)
    }
    if (typeof value === "object") {
      return Object.keys(value).length === 0
        ? "{}"
        : JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  const renderSection = (title: string, data: unknown, isRoot = false) => {
    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      return null
    }

    return (
      <div className={`inspect-section ${isRoot ? "root-section" : ""}`}>
        <h3 className="section-title">{title}</h3>
        <div className="section-content">
          {typeof data === "object" && !Array.isArray(data) ? (
            Object.entries(data).map(([key, value]) => (
              <div key={key} className="field-row">
                <span className="field-key">{key}:</span>
                <div className="field-value">
                  {typeof value === "object" && value !== null ? (
                    <pre className="json-value">{formatValue(value)}</pre>
                  ) : (
                    <span className={`scalar-value ${typeof value}`}>
                      {formatValue(value)}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <pre className="json-value">{formatValue(data)}</pre>
          )}
        </div>
      </div>
    )
  }

  if (!isVisible) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="inspect-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Container Inspect: {containerName}</h2>
          <div className="header-actions">
            <button
              className={`copy-button ${copySuccess ? "success" : ""}`}
              onClick={copyToClipboard}
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
              {renderSection(
                "Basic Information",
                {
                  Id: containerDetails.Id,
                  Name: containerDetails.Name,
                  Created: containerDetails.Created,
                  Path: containerDetails.Path,
                  Args: containerDetails.Args,
                  Platform: containerDetails.Platform,
                  Driver: containerDetails.Driver,
                },
                true
              )}

              {renderSection("State", containerDetails.State)}
              {renderSection("Image", containerDetails.Image)}
              {renderSection("Config", containerDetails.Config)}
              {renderSection("Host Config", containerDetails.HostConfig)}
              {renderSection(
                "Network Settings",
                containerDetails.NetworkSettings
              )}
              {renderSection("Mounts", containerDetails.Mounts)}
              {renderSection("Graph Driver", containerDetails.GraphDriver)}

              {containerDetails.Config.Labels &&
                Object.keys(containerDetails.Config.Labels).length > 0 &&
                renderSection("Labels", containerDetails.Config.Labels)}

              {containerDetails.Config.Env &&
                containerDetails.Config.Env.length > 0 &&
                renderSection(
                  "Environment Variables",
                  containerDetails.Config.Env
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
