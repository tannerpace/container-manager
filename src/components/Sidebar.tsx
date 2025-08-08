import { useDocker } from "../hooks/useDocker"
import "./Sidebar.css"

interface SidebarProps {
  activeTab: "containers" | "images" | "volumes" | "networks"
  onTabChange: (tab: "containers" | "images" | "volumes" | "networks") => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { systemUsage, refreshSystemUsage } = useDocker()

  // Add logging to track system usage updates
  console.log("📊 Sidebar: Current system usage:", systemUsage)

  // Add manual refresh handler for testing
  const handleSystemRefresh = () => {
    console.log("🔄 Sidebar: Manual system refresh triggered")
    if (refreshSystemUsage) {
      refreshSystemUsage()
    }
  }

  // Add logging to track system usage updates
  console.log("📊 Sidebar: Current system usage:", systemUsage)

  const menuItems = [
    {
      id: "containers" as const,
      label: "Containers",
      icon: "📦",
      tooltip: "Manage Docker containers",
    },
    {
      id: "images" as const,
      label: "Images",
      icon: "💿",
      tooltip: "Manage Docker images",
    },
    {
      id: "volumes" as const,
      label: "Volumes",
      icon: "💾",
      tooltip: "Manage Docker volumes",
    },
    {
      id: "networks" as const,
      label: "Networks",
      icon: "🌐",
      tooltip: "Manage Docker networks",
    },
  ]

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => onTabChange(item.id)}
            data-tooltip={item.tooltip}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
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

        {/* Debug button for testing system refresh */}
        <button
          onClick={handleSystemRefresh}
          style={{
            marginTop: "10px",
            padding: "5px 10px",
            fontSize: "12px",
            background: "#444",
            border: "1px solid #666",
            borderRadius: "4px",
            color: "#fff",
            cursor: "pointer",
          }}
          title="Refresh system stats manually"
        >
          🔄 Refresh Stats
        </button>
      </div>
    </aside>
  )
}
