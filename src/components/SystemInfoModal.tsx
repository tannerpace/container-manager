import { useEffect, useState } from "react"
import "./SystemInfoModal.css"

interface SystemInfo {
  nodeVersion: string | null
  npmVersion: string | null
  pythonVersion: string | null
  javaVersion: string | null
  dockerVersion: string | null
  osInfo: string | null
  architecture: string | null
  hostname: string | null
  totalMemory: string | null
  availableMemory: string | null
  cpuInfo: string | null
  timezone: string | null
  userAgent: string | null
}

interface SystemInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SystemInfoModal({ isOpen, onClose }: SystemInfoModalProps) {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    nodeVersion: null,
    npmVersion: null,
    pythonVersion: null,
    javaVersion: null,
    dockerVersion: null,
    osInfo: null,
    architecture: null,
    hostname: null,
    totalMemory: null,
    availableMemory: null,
    cpuInfo: null,
    timezone: null,
    userAgent: null,
  })
  const [loading, setLoading] = useState(false)

  const fetchSystemInfo = async () => {
    setLoading(true)
    try {
      const info: SystemInfo = {
        nodeVersion: null,
        npmVersion: null,
        pythonVersion: null,
        javaVersion: null,
        dockerVersion: null,
        osInfo: null,
        architecture: null,
        hostname: null,
        totalMemory: null,
        availableMemory: null,
        cpuInfo: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        userAgent: navigator.userAgent,
      }

      // Get browser/system information that's available
      if (navigator.platform) {
        info.osInfo = navigator.platform
      }

      if (navigator.hardwareConcurrency) {
        info.cpuInfo = `${navigator.hardwareConcurrency} cores`
      }

      // Get memory info if available (Chrome only)
      if (
        "memory" in performance &&
        (
          performance as unknown as {
            memory: { jsHeapSizeLimit: number; usedJSHeapSize: number }
          }
        ).memory
      ) {
        const memory = (
          performance as unknown as {
            memory: { jsHeapSizeLimit: number; usedJSHeapSize: number }
          }
        ).memory
        info.totalMemory = `${Math.round(
          memory.jsHeapSizeLimit / 1024 / 1024
        )} MB (JS Heap)`
        info.availableMemory = `${Math.round(
          memory.usedJSHeapSize / 1024 / 1024
        )} MB used`
      }

      // Try to get Docker version from the API
      try {
        const dockerResponse = await fetch("http://localhost:2375/version")
        if (dockerResponse.ok) {
          const dockerData = await dockerResponse.json()
          info.dockerVersion = dockerData.Version
        }
      } catch (error) {
        console.log("Could not fetch Docker version:", error)
      }

      // For Electron environment, we could get more detailed system info
      // Check if we're in Electron
      if (window.electronAPI) {
        try {
          const electronInfo = await window.electronAPI.getSystemInfo()
          info.nodeVersion = electronInfo.nodeVersion
          info.osInfo = electronInfo.osInfo
          info.architecture = electronInfo.architecture
          info.hostname = electronInfo.hostname
          info.totalMemory = electronInfo.totalMemory.toString()
          info.availableMemory = electronInfo.availableMemory.toString()
        } catch (error) {
          console.log("Could not fetch Electron system info:", error)
        }
      }

      setSystemInfo(info)
    } catch (error) {
      console.error("Error fetching system info:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchSystemInfo()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const copyToClipboard = () => {
    const infoText = Object.entries(systemInfo)
      .filter(([, value]) => value !== null)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\\n")

    navigator.clipboard
      .writeText(infoText)
      .then(() => {
        alert("System information copied to clipboard!")
      })
      .catch(() => {
        alert("Failed to copy to clipboard")
      })
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="system-info-modal">
        <div className="modal-header">
          <h2>System Information</h2>
          <div className="header-actions">
            <button
              className="copy-btn"
              onClick={copyToClipboard}
              data-tooltip="Copy all information"
            >
              📋
            </button>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Gathering system information...</p>
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-section">
                <h3>🖥️ System</h3>
                <div className="info-items">
                  {systemInfo.osInfo && (
                    <div className="info-item">
                      <span className="label">Operating System:</span>
                      <span className="value">{systemInfo.osInfo}</span>
                    </div>
                  )}
                  {systemInfo.architecture && (
                    <div className="info-item">
                      <span className="label">Architecture:</span>
                      <span className="value">{systemInfo.architecture}</span>
                    </div>
                  )}
                  {systemInfo.hostname && (
                    <div className="info-item">
                      <span className="label">Hostname:</span>
                      <span className="value">{systemInfo.hostname}</span>
                    </div>
                  )}
                  {systemInfo.cpuInfo && (
                    <div className="info-item">
                      <span className="label">CPU Cores:</span>
                      <span className="value">{systemInfo.cpuInfo}</span>
                    </div>
                  )}
                  {systemInfo.totalMemory && (
                    <div className="info-item">
                      <span className="label">Total Memory:</span>
                      <span className="value">{systemInfo.totalMemory}</span>
                    </div>
                  )}
                  {systemInfo.availableMemory && (
                    <div className="info-item">
                      <span className="label">Available Memory:</span>
                      <span className="value">
                        {systemInfo.availableMemory}
                      </span>
                    </div>
                  )}
                  {systemInfo.timezone && (
                    <div className="info-item">
                      <span className="label">Timezone:</span>
                      <span className="value">{systemInfo.timezone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-section">
                <h3>🛠️ Runtime Environment</h3>
                <div className="info-items">
                  {systemInfo.nodeVersion && (
                    <div className="info-item">
                      <span className="label">Node.js:</span>
                      <span className="value">{systemInfo.nodeVersion}</span>
                    </div>
                  )}
                  {systemInfo.npmVersion && (
                    <div className="info-item">
                      <span className="label">npm:</span>
                      <span className="value">{systemInfo.npmVersion}</span>
                    </div>
                  )}
                  {systemInfo.pythonVersion && (
                    <div className="info-item">
                      <span className="label">Python:</span>
                      <span className="value">{systemInfo.pythonVersion}</span>
                    </div>
                  )}
                  {systemInfo.javaVersion && (
                    <div className="info-item">
                      <span className="label">Java:</span>
                      <span className="value">{systemInfo.javaVersion}</span>
                    </div>
                  )}
                  {systemInfo.dockerVersion && (
                    <div className="info-item">
                      <span className="label">Docker:</span>
                      <span className="value">{systemInfo.dockerVersion}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-section">
                <h3>🌐 Browser</h3>
                <div className="info-items">
                  {systemInfo.userAgent && (
                    <div className="info-item">
                      <span className="label">User Agent:</span>
                      <span className="value user-agent">
                        {systemInfo.userAgent}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <p className="info-note">
            ℹ️ Some information may be limited in browser environment. For
            complete system details, use the desktop application.
          </p>
        </div>
      </div>
    </div>
  )
}
