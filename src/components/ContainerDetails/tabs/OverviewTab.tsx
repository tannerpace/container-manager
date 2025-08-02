import React from "react"
import type { DockerContainerDetails } from "../../../types/docker"
import "./OverviewTab.css"

interface OverviewTabProps {
  container: DockerContainerDetails
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ container }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatUptime = (startedAt: string) => {
    if (!startedAt || startedAt === "0001-01-01T00:00:00Z") return "Not started"

    const start = new Date(startedAt)
    const now = new Date()
    const diff = now.getTime() - start.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const getStatusBadge = (container: DockerContainerDetails) => {
    if (container.State.Running)
      return <span className="badge badge-success">Running</span>
    if (container.State.Paused)
      return <span className="badge badge-warning">Paused</span>
    if (container.State.Restarting)
      return <span className="badge badge-info">Restarting</span>
    if (container.State.Dead)
      return <span className="badge badge-danger">Dead</span>
    return <span className="badge badge-secondary">Stopped</span>
  }

  const getRestartPolicyText = (policy: {
    Name: string
    MaximumRetryCount: number
  }) => {
    switch (policy.Name) {
      case "no":
        return "No restart"
      case "always":
        return "Always restart"
      case "unless-stopped":
        return "Restart unless stopped"
      case "on-failure":
        return `Restart on failure (max ${policy.MaximumRetryCount} retries)`
      default:
        return policy.Name
    }
  }

  return (
    <div className="overview-tab">
      <div className="info-grid">
        {/* Basic Information */}
        <div className="info-card">
          <h4>Basic Information</h4>
          <div className="info-row">
            <span className="info-label">Container ID:</span>
            <span className="info-value code">
              {container.Id.substring(0, 12)}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Full ID:</span>
            <span className="info-value code" title={container.Id}>
              {container.Id}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">
              {container.Name.replace("/", "")}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Status:</span>
            <span className="info-value status">
              {getStatusBadge(container)}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Image:</span>
            <span className="info-value">{container.Config.Image}</span>
          </div>
        </div>

        {/* State Information */}
        <div className="info-card">
          <h4>State</h4>
          <div className="info-row">
            <span className="info-label">Running:</span>
            <span className="info-value">
              {container.State.Running ? "✅ Yes" : "❌ No"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Paused:</span>
            <span className="info-value">
              {container.State.Paused ? "✅ Yes" : "❌ No"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">PID:</span>
            <span className="info-value">{container.State.Pid || "N/A"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Exit Code:</span>
            <span className="info-value">{container.State.ExitCode}</span>
          </div>
          {container.State.Error && (
            <div className="info-row">
              <span className="info-label">Error:</span>
              <span className="info-value text-danger">
                {container.State.Error}
              </span>
            </div>
          )}
        </div>

        {/* Timing Information */}
        <div className="info-card">
          <h4>Timing</h4>
          <div className="info-row">
            <span className="info-label">Created:</span>
            <span className="info-value">{formatDate(container.Created)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Started:</span>
            <span className="info-value">
              {container.State.StartedAt &&
              container.State.StartedAt !== "0001-01-01T00:00:00Z"
                ? formatDate(container.State.StartedAt)
                : "Never started"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Uptime:</span>
            <span className="info-value">
              {container.State.Running
                ? formatUptime(container.State.StartedAt)
                : "Not running"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Finished:</span>
            <span className="info-value">
              {container.State.FinishedAt &&
              container.State.FinishedAt !== "0001-01-01T00:00:00Z"
                ? formatDate(container.State.FinishedAt)
                : "Not finished"}
            </span>
          </div>
        </div>

        {/* Configuration */}
        <div className="info-card">
          <h4>Configuration</h4>
          <div className="info-row">
            <span className="info-label">Hostname:</span>
            <span className="info-value">
              {container.Config.Hostname || "N/A"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">User:</span>
            <span className="info-value">
              {container.Config.User || "root"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Working Dir:</span>
            <span className="info-value code">
              {container.Config.WorkingDir || "/"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Platform:</span>
            <span className="info-value">{container.Platform}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Driver:</span>
            <span className="info-value">{container.Driver}</span>
          </div>
        </div>

        {/* Runtime Configuration */}
        <div className="info-card">
          <h4>Runtime</h4>
          <div className="info-row">
            <span className="info-label">Restart Policy:</span>
            <span className="info-value">
              {getRestartPolicyText(container.HostConfig.RestartPolicy)}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Restart Count:</span>
            <span className="info-value">{container.RestartCount}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Auto Remove:</span>
            <span className="info-value">
              {container.HostConfig.AutoRemove ? "✅ Yes" : "❌ No"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">TTY:</span>
            <span className="info-value">
              {container.Config.Tty ? "✅ Yes" : "❌ No"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Interactive:</span>
            <span className="info-value">
              {container.Config.OpenStdin ? "✅ Yes" : "❌ No"}
            </span>
          </div>
        </div>

        {/* Resource Limits */}
        <div className="info-card">
          <h4>Resource Limits</h4>
          <div className="info-row">
            <span className="info-label">Memory:</span>
            <span className="info-value">
              {container.HostConfig.Memory > 0
                ? `${(container.HostConfig.Memory / 1024 / 1024).toFixed(0)} MB`
                : "Unlimited"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">CPU Shares:</span>
            <span className="info-value">
              {container.HostConfig.CpuShares > 0
                ? container.HostConfig.CpuShares
                : "Default"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Nano CPUs:</span>
            <span className="info-value">
              {container.HostConfig.NanoCpus > 0
                ? (container.HostConfig.NanoCpus / 1000000000).toFixed(2)
                : "Unlimited"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">PID Limit:</span>
            <span className="info-value">
              {container.HostConfig.PidsLimit || "Unlimited"}
            </span>
          </div>
        </div>
      </div>

      {/* Command and Arguments */}
      {(container.Config.Cmd || container.Config.Entrypoint) && (
        <div className="tab-section">
          <h3 className="section-title">Command</h3>
          <div className="info-card">
            {container.Config.Entrypoint && (
              <div className="info-row">
                <span className="info-label">Entrypoint:</span>
                <span className="info-value code">
                  {Array.isArray(container.Config.Entrypoint)
                    ? container.Config.Entrypoint.join(" ")
                    : container.Config.Entrypoint}
                </span>
              </div>
            )}
            {container.Config.Cmd && (
              <div className="info-row">
                <span className="info-label">Command:</span>
                <span className="info-value code">
                  {Array.isArray(container.Config.Cmd)
                    ? container.Config.Cmd.join(" ")
                    : container.Config.Cmd}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Port Mappings */}
      {container.NetworkSettings.Ports &&
        Object.keys(container.NetworkSettings.Ports).length > 0 && (
          <div className="tab-section">
            <h3 className="section-title">Port Mappings</h3>
            <div className="ports-grid">
              {Object.entries(container.NetworkSettings.Ports).map(
                ([containerPort, hostPorts]) => (
                  <div key={containerPort} className="port-mapping">
                    <div className="container-port">{containerPort}</div>
                    <div className="port-arrow">→</div>
                    <div className="host-ports">
                      {hostPorts && hostPorts.length > 0 ? (
                        hostPorts.map((hp, idx) => (
                          <div key={idx} className="host-port">
                            {hp.HostIp || "0.0.0.0"}:{hp.HostPort}
                          </div>
                        ))
                      ) : (
                        <div className="host-port unpublished">
                          Not published
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
    </div>
  )
}
