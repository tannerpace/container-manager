import React from "react"
import type { DockerContainerDetails, NetworkInfo } from "../../../types/docker"
import "./NetworkTab.css"

interface NetworkTabProps {
  container: DockerContainerDetails
}

export const NetworkTab: React.FC<NetworkTabProps> = ({ container }) => {
  const networks: NetworkInfo[] = Object.entries(
    container.NetworkSettings.Networks || {}
  ).map(([name, network]) => ({
    name,
    networkId: network.NetworkID,
    endpointId: network.EndpointID,
    gateway: network.Gateway,
    ipAddress: network.IPAddress,
    ipPrefixLen: network.IPPrefixLen,
    macAddress: network.MacAddress,
  }))

  const formatIPWithPrefix = (ip: string, prefixLen: number) => {
    if (!ip) return "N/A"
    return prefixLen > 0 ? `${ip}/${prefixLen}` : ip
  }

  if (networks.length === 0) {
    return (
      <div className="network-tab">
        <div className="empty-state">
          <div className="empty-icon">🌐</div>
          <h4>No Network Connections</h4>
          <p>This container is not connected to any networks.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="network-tab">
      {/* Network Overview */}
      <div className="tab-section">
        <h3 className="section-title">Network Configuration</h3>
        <div className="info-grid">
          <div className="info-card">
            <h4>General Settings</h4>
            <div className="info-row">
              <span className="info-label">Network Mode:</span>
              <span className="info-value">
                {container.HostConfig.NetworkMode}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Bridge:</span>
              <span className="info-value">
                {container.NetworkSettings.Bridge || "N/A"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Sandbox ID:</span>
              <span className="info-value code">
                {container.NetworkSettings.SandboxID?.substring(0, 12) || "N/A"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Hairpin Mode:</span>
              <span className="info-value">
                {container.NetworkSettings.HairpinMode
                  ? "✅ Enabled"
                  : "❌ Disabled"}
              </span>
            </div>
          </div>

          <div className="info-card">
            <h4>IP Configuration</h4>
            <div className="info-row">
              <span className="info-label">IP Address:</span>
              <span className="info-value code">
                {formatIPWithPrefix(
                  container.NetworkSettings.IPAddress,
                  container.NetworkSettings.IPPrefixLen
                )}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Gateway:</span>
              <span className="info-value code">
                {container.NetworkSettings.Gateway || "N/A"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">IPv6 Address:</span>
              <span className="info-value code">
                {container.NetworkSettings.GlobalIPv6Address || "N/A"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">IPv6 Gateway:</span>
              <span className="info-value code">
                {container.NetworkSettings.IPv6Gateway || "N/A"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">MAC Address:</span>
              <span className="info-value code">
                {container.NetworkSettings.MacAddress || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Networks */}
      <div className="tab-section">
        <h3 className="section-title">
          Connected Networks ({networks.length})
        </h3>
        <div className="networks-grid">
          {networks.map((network, index) => (
            <div key={`${network.name}-${index}`} className="network-card">
              <div className="network-header">
                <h4 className="network-name">{network.name}</h4>
                <span className="network-status connected">Connected</span>
              </div>

              <div className="network-details">
                <div className="network-detail-row">
                  <span className="detail-label">Network ID:</span>
                  <span className="detail-value code" title={network.networkId}>
                    {network.networkId?.substring(0, 12) || "N/A"}
                  </span>
                </div>

                <div className="network-detail-row">
                  <span className="detail-label">Endpoint ID:</span>
                  <span
                    className="detail-value code"
                    title={network.endpointId}
                  >
                    {network.endpointId?.substring(0, 12) || "N/A"}
                  </span>
                </div>

                <div className="network-detail-row">
                  <span className="detail-label">IP Address:</span>
                  <span className="detail-value code">
                    {formatIPWithPrefix(network.ipAddress, network.ipPrefixLen)}
                  </span>
                </div>

                <div className="network-detail-row">
                  <span className="detail-label">Gateway:</span>
                  <span className="detail-value code">
                    {network.gateway || "N/A"}
                  </span>
                </div>

                <div className="network-detail-row">
                  <span className="detail-label">MAC Address:</span>
                  <span className="detail-value code">
                    {network.macAddress || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Port Bindings */}
      {container.NetworkSettings.Ports &&
        Object.keys(container.NetworkSettings.Ports).length > 0 && (
          <div className="tab-section">
            <h3 className="section-title">Port Bindings</h3>
            <div className="ports-table-container">
              <table className="ports-table">
                <thead>
                  <tr>
                    <th>Container Port</th>
                    <th>Protocol</th>
                    <th>Host Interface</th>
                    <th>Host Port</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(container.NetworkSettings.Ports).map(
                    ([containerPort, hostPorts]) => {
                      const [port, protocol] = containerPort.split("/")

                      if (!hostPorts || hostPorts.length === 0) {
                        return (
                          <tr key={containerPort} className="unpublished-port">
                            <td className="port-cell">{port}</td>
                            <td className="protocol-cell">
                              {protocol?.toUpperCase()}
                            </td>
                            <td className="host-interface-cell">-</td>
                            <td className="host-port-cell">-</td>
                            <td className="status-cell">
                              <span className="port-status unpublished">
                                Not Published
                              </span>
                            </td>
                          </tr>
                        )
                      }

                      return hostPorts.map((hostPort, idx) => (
                        <tr
                          key={`${containerPort}-${idx}`}
                          className="published-port"
                        >
                          <td className="port-cell">{port}</td>
                          <td className="protocol-cell">
                            {protocol?.toUpperCase()}
                          </td>
                          <td className="host-interface-cell">
                            {hostPort.HostIp || "0.0.0.0"}
                          </td>
                          <td className="host-port-cell">
                            {hostPort.HostPort}
                          </td>
                          <td className="status-cell">
                            <span className="port-status published">
                              Published
                            </span>
                          </td>
                        </tr>
                      ))
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Network Statistics Summary */}
      <div className="tab-section">
        <h3 className="section-title">Summary</h3>
        <div className="network-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Connected Networks:</span>
              <span className="stat-value">{networks.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Published Ports:</span>
              <span className="stat-value">
                {
                  Object.entries(container.NetworkSettings.Ports || {}).filter(
                    ([, hostPorts]) => hostPorts && hostPorts.length > 0
                  ).length
                }
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Exposed Ports:</span>
              <span className="stat-value">
                {Object.keys(container.Config.ExposedPorts || {}).length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Network Mode:</span>
              <span className="stat-value">
                {container.HostConfig.NetworkMode}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
