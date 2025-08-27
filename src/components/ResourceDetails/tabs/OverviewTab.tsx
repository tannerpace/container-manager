
import React from "react"
import type { DockerContainerDetails } from "../../../types/docker"
import { InfoCard } from "../shared/InfoCard"
import { InfoRow } from "../shared/InfoRow"
import { Section } from "../shared/Section"
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
        <InfoCard title="Basic Information">
          <InfoRow label="Container ID:" value={<span className="code">{container.Id.substring(0, 12)}</span>} />
          <InfoRow label="Full ID:" value={<span className="code" title={container.Id}>{container.Id}</span>} />
          <InfoRow label="Name:" value={container.Name.replace("/", "")} />
          <InfoRow label="Status:" value={<span className="status">{getStatusBadge(container)}</span>} />
          <InfoRow label="Image:" value={container.Config.Image} />
        </InfoCard>

        <InfoCard title="State">
          <InfoRow label="Running:" value={container.State.Running ? "✅ Yes" : "❌ No"} />
          <InfoRow label="Paused:" value={container.State.Paused ? "✅ Yes" : "❌ No"} />
          <InfoRow label="PID:" value={container.State.Pid || "N/A"} />
          <InfoRow label="Exit Code:" value={container.State.ExitCode} />
          {container.State.Error && (
            <InfoRow label="Error:" value={<span className="text-danger">{container.State.Error}</span>} />
          )}
        </InfoCard>

        <InfoCard title="Timing">
          <InfoRow label="Created:" value={formatDate(container.Created)} />
          <InfoRow label="Started:" value={container.State.StartedAt && container.State.StartedAt !== "0001-01-01T00:00:00Z" ? formatDate(container.State.StartedAt) : "Never started"} />
          <InfoRow label="Uptime:" value={container.State.Running ? formatUptime(container.State.StartedAt) : "Not running"} />
          <InfoRow label="Finished:" value={container.State.FinishedAt && container.State.FinishedAt !== "0001-01-01T00:00:00Z" ? formatDate(container.State.FinishedAt) : "Not finished"} />
        </InfoCard>

        <InfoCard title="Configuration">
          <InfoRow label="Hostname:" value={container.Config.Hostname || "N/A"} />
          <InfoRow label="User:" value={container.Config.User || "root"} />
          <InfoRow label="Working Dir:" value={<span className="code">{container.Config.WorkingDir || "/"}</span>} />
          <InfoRow label="Platform:" value={container.Platform} />
          <InfoRow label="Driver:" value={container.Driver} />
        </InfoCard>

        <InfoCard title="Runtime">
          <InfoRow label="Restart Policy:" value={getRestartPolicyText(container.HostConfig.RestartPolicy)} />
          <InfoRow label="Auto Remove:" value={container.HostConfig.AutoRemove ? "✅ Yes" : "❌ No"} />
          <InfoRow label="TTY:" value={container.Config.Tty ? "✅ Yes" : "❌ No"} />
          <InfoRow label="Interactive:" value={container.Config.OpenStdin ? "✅ Yes" : "❌ No"} />
        </InfoCard>

        <InfoCard title="Resource Limits">
          <InfoRow label="Memory:" value={container.HostConfig.Memory > 0 ? `${(container.HostConfig.Memory / 1024 / 1024).toFixed(0)} MB` : "Unlimited"} />
          <InfoRow label="CPU Shares:" value={container.HostConfig.CpuShares > 0 ? container.HostConfig.CpuShares : "Default"} />
          <InfoRow label="Nano CPUs:" value={container.HostConfig.NanoCpus > 0 ? (container.HostConfig.NanoCpus / 1000000000).toFixed(2) : "Unlimited"} />
          <InfoRow label="PID Limit:" value={container.HostConfig.PidsLimit || "Unlimited"} />
        </InfoCard>
      </div>

      {(container.Config.Cmd || container.Config.Entrypoint) && (
        <Section title="Command">
          <InfoCard title="">
            {container.Config.Entrypoint && (
              <InfoRow label="Entrypoint:" value={<span className="code">{Array.isArray(container.Config.Entrypoint) ? container.Config.Entrypoint.join(" ") : container.Config.Entrypoint}</span>} />
            )}
            {container.Config.Cmd && (
              <InfoRow label="Command:" value={<span className="code">{Array.isArray(container.Config.Cmd) ? container.Config.Cmd.join(" ") : container.Config.Cmd}</span>} />
            )}
          </InfoCard>
        </Section>
      )}

      {container.NetworkSettings.Ports && Object.keys(container.NetworkSettings.Ports).length > 0 && (
        <Section title="Port Mappings">
          <div className="ports-grid">
            {Object.entries(container.NetworkSettings.Ports).map(
              ([containerPort, hostPorts]) => (
                <div key={containerPort} className="port-mapping">
                  <div className="container-port">{containerPort}</div>
                  <div className="port-arrow">→</div>
                  <div className="host-ports">
                    {hostPorts && hostPorts.length > 0 ? (
                      hostPorts.map((hp, idx) => {
                        const hostAddress = hp.HostIp || "localhost"
                        const hostPort = hp.HostPort
                        const url = `http://${hostAddress === "0.0.0.0" ? "localhost" : hostAddress}:${hostPort}`
                        return (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="host-port"
                            title={`Open ${url} in new tab`}
                          >
                            {hostAddress}:{hostPort}
                          </a>
                        )
                      })
                    ) : (
                      <div className="host-port unpublished">Not published</div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </Section>
      )}
    </div>
  )
}
