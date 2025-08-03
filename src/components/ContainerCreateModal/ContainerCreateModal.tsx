import React, { useState } from "react"
import type { DockerContainer, DockerImage } from "../../types/dockerTypes"
import "./ContainerCreateModal.css"

interface ContainerCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateContainer: (config: ContainerConfig) => Promise<void>
  sourceImage?: DockerImage
  sourceContainer?: DockerContainer
  mode: "create" | "duplicate"
}

export interface ContainerConfig {
  image: string
  name?: string
  // Resource Limits
  memory?: number // in MB
  memorySwap?: number // in MB
  cpus?: number // CPU quota (0.5 = 50% of one CPU)
  cpuShares?: number // CPU shares (relative weight)
  // Storage
  volumes?: { host: string; container: string; mode: "ro" | "rw" }[]
  // Network
  ports?: { host: number; container: number; protocol: "tcp" | "udp" }[]
  networkMode?: string
  // Environment
  environment?: { key: string; value: string }[]
  workingDir?: string
  // Startup
  command?: string
  entrypoint?: string
  restart?: "no" | "always" | "unless-stopped" | "on-failure"
  autoRemove?: boolean
}

export const ContainerCreateModal: React.FC<ContainerCreateModalProps> = ({
  isOpen,
  onClose,
  onCreateContainer,
  sourceImage,
  sourceContainer,
  mode,
}) => {
  // Initialize config based on mode
  const getInitialConfig = (): ContainerConfig => {
    if (mode === "duplicate" && sourceContainer) {
      return {
        image: sourceContainer.Image,
        name: `${
          sourceContainer.Names[0]?.replace("/", "") || "container"
        }-copy`,
        memory: 512, // Default values - we'll extract from inspect later
        cpus: 1,
        restart: "no",
        autoRemove: false,
        volumes: [],
        ports: [],
        environment: [],
      }
    } else if (mode === "create" && sourceImage) {
      return {
        image: sourceImage.RepoTags?.[0] || sourceImage.Id,
        name: "",
        memory: 512,
        cpus: 1,
        restart: "no",
        autoRemove: false,
        volumes: [],
        ports: [],
        environment: [],
      }
    }
    return {
      image: "",
      memory: 512,
      cpus: 1,
      restart: "no",
      autoRemove: false,
      volumes: [],
      ports: [],
      environment: [],
    }
  }

  const [config, setConfig] = useState<ContainerConfig>(getInitialConfig)
  const [activeTab, setActiveTab] = useState<
    "basic" | "resources" | "network" | "volumes" | "environment"
  >("basic")
  const [isCreating, setIsCreating] = useState(false)

  const updateConfig = (updates: Partial<ContainerConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  const addPort = () => {
    const newPorts = [
      ...(config.ports || []),
      { host: 8080, container: 80, protocol: "tcp" as const },
    ]
    updateConfig({ ports: newPorts })
  }

  const removePort = (index: number) => {
    const newPorts = config.ports?.filter((_, i) => i !== index) || []
    updateConfig({ ports: newPorts })
  }

  const updatePort = (index: number, field: string, value: string | number) => {
    const newPorts = [...(config.ports || [])]
    newPorts[index] = { ...newPorts[index], [field]: value }
    updateConfig({ ports: newPorts })
  }

  const addVolume = () => {
    const newVolumes = [
      ...(config.volumes || []),
      { host: "", container: "", mode: "rw" as const },
    ]
    updateConfig({ volumes: newVolumes })
  }

  const removeVolume = (index: number) => {
    const newVolumes = config.volumes?.filter((_, i) => i !== index) || []
    updateConfig({ volumes: newVolumes })
  }

  const updateVolume = (index: number, field: string, value: string) => {
    const newVolumes = [...(config.volumes || [])]
    newVolumes[index] = { ...newVolumes[index], [field]: value }
    updateConfig({ volumes: newVolumes })
  }

  const addEnvironmentVar = () => {
    const newEnv = [...(config.environment || []), { key: "", value: "" }]
    updateConfig({ environment: newEnv })
  }

  const removeEnvironmentVar = (index: number) => {
    const newEnv = config.environment?.filter((_, i) => i !== index) || []
    updateConfig({ environment: newEnv })
  }

  const updateEnvironmentVar = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newEnv = [...(config.environment || [])]
    newEnv[index] = { ...newEnv[index], [field]: value }
    updateConfig({ environment: newEnv })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      // Ensure undefined values get proper defaults
      const finalConfig: ContainerConfig = {
        ...config,
        memory: config.memory || 512,
        cpus: config.cpus || 1,
        cpuShares: config.cpuShares || 1024,
      }
      await onCreateContainer(finalConfig)
      onClose()
    } catch (error) {
      console.error("Failed to create container:", error)
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  const title =
    mode === "duplicate"
      ? `Duplicate Container: ${
          sourceContainer?.Names[0]?.replace("/", "") || "Unknown"
        }`
      : `Create Container from Image: ${
          sourceImage?.RepoTags?.[0] || "Unknown"
        }`

  return (
    <div className="modal-overlay">
      <div className="container-create-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose} disabled={isCreating}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-tabs">
            <button
              type="button"
              className={`tab ${activeTab === "basic" ? "active" : ""}`}
              onClick={() => setActiveTab("basic")}
            >
              Basic
            </button>
            <button
              type="button"
              className={`tab ${activeTab === "resources" ? "active" : ""}`}
              onClick={() => setActiveTab("resources")}
            >
              Resources
            </button>
            <button
              type="button"
              className={`tab ${activeTab === "network" ? "active" : ""}`}
              onClick={() => setActiveTab("network")}
            >
              Network
            </button>
            <button
              type="button"
              className={`tab ${activeTab === "volumes" ? "active" : ""}`}
              onClick={() => setActiveTab("volumes")}
            >
              Volumes
            </button>
            <button
              type="button"
              className={`tab ${activeTab === "environment" ? "active" : ""}`}
              onClick={() => setActiveTab("environment")}
            >
              Environment
            </button>
          </div>

          <div className="modal-content">
            {activeTab === "basic" && (
              <div className="tab-content">
                <div className="form-group">
                  <label htmlFor="container-name">Container Name</label>
                  <input
                    id="container-name"
                    type="text"
                    value={config.name || ""}
                    onChange={(e) => updateConfig({ name: e.target.value })}
                    placeholder="Optional container name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="image-name">Image</label>
                  <input
                    id="image-name"
                    type="text"
                    value={config.image}
                    onChange={(e) => updateConfig({ image: e.target.value })}
                    required
                    readOnly={mode === "duplicate"}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="restart-policy">Restart Policy</label>
                  <select
                    id="restart-policy"
                    value={config.restart}
                    onChange={(e) =>
                      updateConfig({
                        restart: e.target.value as
                          | "no"
                          | "always"
                          | "unless-stopped"
                          | "on-failure",
                      })
                    }
                  >
                    <option value="no">No</option>
                    <option value="always">Always</option>
                    <option value="unless-stopped">Unless Stopped</option>
                    <option value="on-failure">On Failure</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={config.autoRemove || false}
                      onChange={(e) =>
                        updateConfig({ autoRemove: e.target.checked })
                      }
                    />
                    Auto-remove container when it exits
                  </label>
                </div>
              </div>
            )}

            {activeTab === "resources" && (
              <div className="tab-content">
                <div className="form-group">
                  <label htmlFor="memory-limit">Memory Limit (MB)</label>
                  <input
                    id="memory-limit"
                    type="number"
                    min="128"
                    max="32768"
                    value={config.memory || ""}
                    placeholder="512"
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === "") {
                        updateConfig({ memory: undefined })
                      } else {
                        const numValue = parseInt(value)
                        if (!isNaN(numValue)) {
                          updateConfig({ memory: numValue })
                        }
                      }
                    }}
                  />
                  <small>Minimum: 128MB, Maximum: 32GB</small>
                </div>

                <div className="form-group">
                  <label htmlFor="cpu-limit">CPU Limit</label>
                  <input
                    id="cpu-limit"
                    type="number"
                    min="0.1"
                    max="8"
                    step="0.1"
                    value={config.cpus || ""}
                    placeholder="1.0"
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === "") {
                        updateConfig({ cpus: undefined })
                      } else {
                        const numValue = parseFloat(value)
                        if (!isNaN(numValue)) {
                          updateConfig({ cpus: numValue })
                        }
                      }
                    }}
                  />
                  <small>
                    Number of CPUs (e.g., 0.5 = 50% of one CPU, 2.0 = two full
                    CPUs)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="cpu-shares">CPU Shares (Priority)</label>
                  <input
                    id="cpu-shares"
                    type="number"
                    min="1"
                    max="1024"
                    value={config.cpuShares || ""}
                    placeholder="1024"
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === "") {
                        updateConfig({ cpuShares: undefined })
                      } else {
                        const numValue = parseInt(value)
                        if (!isNaN(numValue)) {
                          updateConfig({ cpuShares: numValue })
                        }
                      }
                    }}
                  />
                  <small>Relative priority (1024 = normal priority)</small>
                </div>
              </div>
            )}

            {activeTab === "network" && (
              <div className="tab-content">
                <div className="form-section">
                  <div className="section-header">
                    <h3>Port Mappings</h3>
                    <button type="button" className="add-btn" onClick={addPort}>
                      + Add Port
                    </button>
                  </div>

                  {config.ports?.map((port, index) => (
                    <div key={index} className="port-mapping">
                      <input
                        type="number"
                        placeholder="Host port"
                        value={port.host}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "") {
                            updatePort(index, "host", 0)
                          } else {
                            const numValue = parseInt(value)
                            if (!isNaN(numValue)) {
                              updatePort(index, "host", numValue)
                            }
                          }
                        }}
                      />
                      <span>:</span>
                      <input
                        type="number"
                        placeholder="Container port"
                        value={port.container}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "") {
                            updatePort(index, "container", 0)
                          } else {
                            const numValue = parseInt(value)
                            if (!isNaN(numValue)) {
                              updatePort(index, "container", numValue)
                            }
                          }
                        }}
                      />
                      <select
                        value={port.protocol}
                        onChange={(e) =>
                          updatePort(index, "protocol", e.target.value)
                        }
                      >
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                      </select>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removePort(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "volumes" && (
              <div className="tab-content">
                <div className="form-section">
                  <div className="section-header">
                    <h3>Volume Mounts</h3>
                    <button
                      type="button"
                      className="add-btn"
                      onClick={addVolume}
                    >
                      + Add Volume
                    </button>
                  </div>

                  {config.volumes?.map((volume, index) => (
                    <div key={index} className="volume-mapping">
                      <input
                        type="text"
                        placeholder="Host path"
                        value={volume.host}
                        onChange={(e) =>
                          updateVolume(index, "host", e.target.value)
                        }
                      />
                      <span>:</span>
                      <input
                        type="text"
                        placeholder="Container path"
                        value={volume.container}
                        onChange={(e) =>
                          updateVolume(index, "container", e.target.value)
                        }
                      />
                      <select
                        value={volume.mode}
                        onChange={(e) =>
                          updateVolume(index, "mode", e.target.value)
                        }
                      >
                        <option value="rw">Read/Write</option>
                        <option value="ro">Read Only</option>
                      </select>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeVolume(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "environment" && (
              <div className="tab-content">
                <div className="form-section">
                  <div className="section-header">
                    <h3>Environment Variables</h3>
                    <button
                      type="button"
                      className="add-btn"
                      onClick={addEnvironmentVar}
                    >
                      + Add Variable
                    </button>
                  </div>

                  {config.environment?.map((env, index) => (
                    <div key={index} className="env-var">
                      <input
                        type="text"
                        placeholder="Variable name"
                        value={env.key}
                        onChange={(e) =>
                          updateEnvironmentVar(index, "key", e.target.value)
                        }
                      />
                      <span>=</span>
                      <input
                        type="text"
                        placeholder="Value"
                        value={env.value}
                        onChange={(e) =>
                          updateEnvironmentVar(index, "value", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeEnvironmentVar(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating || !config.image}
            >
              {isCreating
                ? "Creating..."
                : mode === "duplicate"
                ? "Duplicate Container"
                : "Create Container"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
