import "./Sidebar.css"

interface SidebarProps {
  activeTab: "containers" | "images" | "volumes" | "networks"
  onTabChange: (tab: "containers" | "images" | "volumes" | "networks") => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
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
          <div className="stat-item" data-tooltip="Current CPU usage">
            <span className="stat-label">CPU</span>
            <span className="stat-value">12%</span>
          </div>
          <div className="stat-item" data-tooltip="Current memory usage">
            <span className="stat-label">Memory</span>
            <span className="stat-value">2.1GB</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
