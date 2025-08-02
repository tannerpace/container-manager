import React, { useState } from "react"
import type {
  DockerContainerDetails,
  EnvironmentVariable,
} from "../../../types/docker"
import "./EnvironmentTab.css"

interface EnvironmentTabProps {
  container: DockerContainerDetails
}

export const EnvironmentTab: React.FC<EnvironmentTabProps> = ({
  container,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [showValues, setShowValues] = useState(true)

  // Parse environment variables from container config
  const envVars: EnvironmentVariable[] = (container.Config.Env || [])
    .map((envString) => {
      const [key, ...valueParts] = envString.split("=")
      const value = valueParts.join("=")

      // Detect common secret/sensitive patterns
      const isSecret =
        /^(.*_)?(PASSWORD|SECRET|KEY|TOKEN|PASS|PWD|AUTH|PRIVATE)(_.*)?$/i.test(
          key
        )

      return {
        key,
        value,
        isSecret,
      }
    })
    .sort((a, b) => a.key.localeCompare(b.key))

  // Filter environment variables based on search term
  const filteredEnvVars = envVars.filter(
    (envVar) =>
      envVar.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (showValues &&
        envVar.value.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
      console.log("Copied to clipboard:", text)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  const copyEnvVar = (key: string, value: string) => {
    copyToClipboard(`${key}=${value}`)
  }

  const copyAllEnvVars = () => {
    const envString = filteredEnvVars
      .map((env) => `${env.key}=${env.value}`)
      .join("\n")
    copyToClipboard(envString)
  }

  const exportAsFile = () => {
    const envString = filteredEnvVars
      .map((env) => `${env.key}=${env.value}`)
      .join("\n")

    const blob = new Blob([envString], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${container.Name.replace("/", "")}-env.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (envVars.length === 0) {
    return (
      <div className="environment-tab">
        <div className="empty-state">
          <div className="empty-icon">🌍</div>
          <h4>No Environment Variables</h4>
          <p>This container has no environment variables configured.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="environment-tab">
      {/* Controls */}
      <div className="env-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search environment variables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="search-info">
            {filteredEnvVars.length} of {envVars.length} variables
          </div>
        </div>

        <div className="env-actions">
          <label className="toggle-values">
            <input
              type="checkbox"
              checked={showValues}
              onChange={(e) => setShowValues(e.target.checked)}
            />
            <span>Show values</span>
          </label>

          <button
            onClick={copyAllEnvVars}
            className="action-btn copy-all-btn"
            title="Copy all visible variables"
          >
            📋 Copy All
          </button>

          <button
            onClick={exportAsFile}
            className="action-btn export-btn"
            title="Export as .env file"
          >
            💾 Export
          </button>
        </div>
      </div>

      {/* Environment Variables Table */}
      <div className="env-table-container">
        <table className="env-table">
          <thead>
            <tr>
              <th className="col-key">Variable</th>
              <th className="col-value">Value</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnvVars.map((envVar, index) => (
              <tr
                key={`${envVar.key}-${index}`}
                className={envVar.isSecret ? "secret-row" : ""}
              >
                <td className="col-key">
                  <div className="key-cell">
                    <span className="key-name">{envVar.key}</span>
                    {envVar.isSecret && (
                      <span
                        className="secret-badge"
                        title="Potentially sensitive"
                      >
                        🔒
                      </span>
                    )}
                  </div>
                </td>
                <td className="col-value">
                  <div className="value-cell">
                    {showValues ? (
                      <span
                        className={`value-text ${
                          envVar.isSecret ? "secret-value" : ""
                        }`}
                      >
                        {envVar.isSecret && !showValues
                          ? "••••••••"
                          : envVar.value}
                      </span>
                    ) : (
                      <span className="value-hidden">••••••••</span>
                    )}
                  </div>
                </td>
                <td className="col-actions">
                  <div className="row-actions">
                    <button
                      onClick={() => copyEnvVar(envVar.key, envVar.value)}
                      className="row-action-btn copy-btn"
                      title="Copy variable"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => copyToClipboard(envVar.key)}
                      className="row-action-btn copy-key-btn"
                      title="Copy key only"
                    >
                      🔑
                    </button>
                    <button
                      onClick={() => copyToClipboard(envVar.value)}
                      className="row-action-btn copy-value-btn"
                      title="Copy value only"
                    >
                      📄
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEnvVars.length === 0 && searchTerm && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h4>No matches found</h4>
          <p>No environment variables match your search term "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm("")}
            className="clear-search-btn"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="env-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Variables:</span>
            <span className="stat-value">{envVars.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Potentially Sensitive:</span>
            <span className="stat-value">
              {envVars.filter((env) => env.isSecret).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Visible:</span>
            <span className="stat-value">{filteredEnvVars.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
