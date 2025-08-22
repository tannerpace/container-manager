import { NavLink } from "react-router-dom"
import { useDocker } from "../hooks/useDocker"
import "./Sidebar.css"

export function Sidebar() {
  const { systemUsage } = useDocker()

  // Add logging to track system usage updates
  console.log("📊 Sidebar: Current system usage:", systemUsage)

  // Add logging to track system usage updates
  console.log("📊 Sidebar: Current system usage:", systemUsage)

  const menuItems = [
    {
      id: "containers",
      label: "Containers",
      icon: "📦",
      tooltip: "Manage Docker containers",
      path: "/containers",
    },
    {
      id: "images",
      label: "Images",
      icon: "💿",
      tooltip: "Manage Docker images",
      path: "/images",
    },
    {
      id: "volumes",
      label: "Volumes",
      icon: "💾",
      tooltip: "Manage Docker volumes",
      path: "/volumes",
    },
    {
      id: "networks",
      label: "Networks",
      icon: "🌐",
      tooltip: "Manage Docker networks",
      path: "/networks",
    },
  ]

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            data-tooltip={item.tooltip}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="resource-stats">
          <div
            className="stat-item"
            data-tooltip={
              systemUsage
                ? `CPU Usage: ${systemUsage.cpuPercent.toFixed(1)}%`
                : "CPU usage unavailable"
            }
          >
            <span className="stat-label">CPU</span>
            <span className="stat-value">
              {systemUsage ? `${systemUsage.cpuPercent.toFixed(1)}%` : "N/A"}
            </span>
          </div>
          <div
            className="stat-item"
            data-tooltip={
              systemUsage
                ? `Memory: ${(
                    systemUsage.memoryUsed /
                    1024 /
                    1024 /
                    1024
                  ).toFixed(1)}GB / ${(
                    systemUsage.memoryTotal /
                    1024 /
                    1024 /
                    1024
                  ).toFixed(1)}GB (${systemUsage.memoryPercent.toFixed(1)}%)`
                : "Memory usage unavailable"
            }
          >
            <span className="stat-label">Memory</span>
            <span className="stat-value">
              {systemUsage
                ? `${(systemUsage.memoryUsed / 1024 / 1024 / 1024).toFixed(
                    1
                  )}GB`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
