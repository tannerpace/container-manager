import React from "react"
import { dockerAPI } from "../../../api/dockerClient"
import type { ContainerStats } from "../../../types/docker"
import "./StatsWidget.css"

interface StatsWidgetProps {
  stats: ContainerStats
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ stats }) => {
  // Debug logging
  console.log("StatsWidget received stats:", stats)

  // Safety check - return early if stats is null/undefined
  if (!stats) {
    return (
      <div className="stats-widget">
        <h3 className="stats-title">Live Performance</h3>
        <div className="stats-error">
          <p>Unable to load performance data</p>
        </div>
      </div>
    )
  }

  const cpuPercent = dockerAPI.calculateCPUPercent(stats)
  const memoryPercent = dockerAPI.calculateMemoryPercent(stats)
  const memoryUsage = dockerAPI.formatBytes(stats.memory_stats?.usage || 0)
  const memoryLimit = dockerAPI.formatBytes(stats.memory_stats?.limit || 0)

  // Debug the calculations
  console.log("CPU calculation:", {
    cpuPercent,
    totalUsage: stats.cpu_stats.cpu_usage.total_usage,
    preTotalUsage: stats.precpu_stats.cpu_usage.total_usage,
    systemUsage: stats.cpu_stats.system_cpu_usage,
    preSystemUsage: stats.precpu_stats.system_cpu_usage,
    onlineCpus: stats.cpu_stats.online_cpus,
  })

  console.log("Memory calculation:", {
    memoryPercent,
    usage: stats.memory_stats.usage,
    limit: stats.memory_stats.limit,
    formattedUsage: memoryUsage,
    formattedLimit: memoryLimit,
  })

  // Calculate network I/O
  const networkRx = stats.networks
    ? Object.values(stats.networks).reduce(
        (total, net) => total + net.rx_bytes,
        0
      )
    : 0
  const networkTx = stats.networks
    ? Object.values(stats.networks).reduce(
        (total, net) => total + net.tx_bytes,
        0
      )
    : 0

  // Calculate block I/O
  const blockRead =
    stats.blkio_stats.io_service_bytes_recursive
      ?.filter((item) => item.op === "Read")
      .reduce((total, item) => total + item.value, 0) || 0
  const blockWrite =
    stats.blkio_stats.io_service_bytes_recursive
      ?.filter((item) => item.op === "Write")
      .reduce((total, item) => total + item.value, 0) || 0

  return (
    <div className="stats-widget">
      <h3 className="stats-title">Live Performance</h3>

      <div className="stats-grid">
        {/* CPU Usage */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">🧠</span>
            <span className="stat-label">CPU</span>
          </div>
          <div className="stat-value">{cpuPercent.toFixed(1)}%</div>
          <div className="progress-bar">
            <div
              className="progress-fill cpu"
              style={{ width: `${Math.min(cpuPercent, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">💾</span>
            <span className="stat-label">Memory</span>
          </div>
          <div className="stat-value">{memoryPercent.toFixed(1)}%</div>
          <div className="stat-details">
            {memoryUsage} / {memoryLimit}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill memory"
              style={{ width: `${Math.min(memoryPercent, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Network I/O */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">🌐</span>
            <span className="stat-label">Network</span>
          </div>
          <div className="stat-io">
            <div className="io-item">
              <span className="io-direction">↓ RX</span>
              <span className="io-value">
                {dockerAPI.formatBytes(networkRx)}
              </span>
            </div>
            <div className="io-item">
              <span className="io-direction">↑ TX</span>
              <span className="io-value">
                {dockerAPI.formatBytes(networkTx)}
              </span>
            </div>
          </div>
        </div>

        {/* Block I/O */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">💿</span>
            <span className="stat-label">Disk I/O</span>
          </div>
          <div className="stat-io">
            <div className="io-item">
              <span className="io-direction">↓ Read</span>
              <span className="io-value">
                {dockerAPI.formatBytes(blockRead)}
              </span>
            </div>
            <div className="io-item">
              <span className="io-direction">↑ Write</span>
              <span className="io-value">
                {dockerAPI.formatBytes(blockWrite)}
              </span>
            </div>
          </div>
        </div>

        {/* Process Count */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">⚙️</span>
            <span className="stat-label">Processes</span>
          </div>
          <div className="stat-value">{stats.pids_stats?.current || 0}</div>
        </div>

        {/* PIDs */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">🔢</span>
            <span className="stat-label">Main PID</span>
          </div>
          <div className="stat-value">
            {stats.pids_stats?.current && stats.pids_stats.current > 0
              ? stats.pids_stats.current
              : "N/A"}
          </div>
        </div>
      </div>
    </div>
  )
}
