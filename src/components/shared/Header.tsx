import { useState } from "react"
import { useLocation } from "react-router-dom"
// import whaleSvg from "../assets/whaley.svg"
import { useDocker } from "../../hooks/useDocker"

import "../Header.css"
import { SystemInfoModal } from "./SystemInfoModal"

export function Header() {
  const location = useLocation()
  const { connected, error, searchTerm, setSearchTerm, refreshContainers, refreshImages, refreshVolumes, refreshNetworks } = useDocker()
  const [isSystemInfoOpen, setIsSystemInfoOpen] = useState(false)

  const getRefreshConfig = () => {
    const path = location.pathname

    if (path === '/' || path === '/containers') {
      return {
        refreshFunction: refreshContainers,
        label: 'Refresh Containers',
        tooltip: 'Refresh containers list'
      }
    } else if (path === '/images') {
      return {
        refreshFunction: refreshImages,
        label: 'Refresh Images',
        tooltip: 'Refresh images list'
      }
    } else if (path === '/volumes') {
      return {
        refreshFunction: refreshVolumes,
        label: 'Refresh Volumes',
        tooltip: 'Refresh volumes list'
      }
    } else if (path === '/networks') {
      return {
        refreshFunction: refreshNetworks,
        label: 'Refresh Networks',
        tooltip: 'Refresh networks list'
      }
    } else {
      // For detail pages or unknown routes, refresh all
      return {
        refreshFunction: async () => {
          await Promise.all([
            refreshContainers(),
            refreshImages(),
            refreshVolumes(),
            refreshNetworks()
          ])
        },
        label: 'Refresh All',
        tooltip: 'Refresh all data (containers, images, volumes, networks)'
      }
    }
  }

  const handleRefresh = async () => {
    try {
      const { refreshFunction } = getRefreshConfig()
      await refreshFunction()
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  return (
    <>
      <header className="header">
        <div className="header-left">
         {/* todo add current page */}
        </div>

        <div className="header-center">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search containers, images..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-tooltip="Search across containers, images, volumes, and networks"
            />
          </div>
        </div>

        <div className="header-right">
          <button
            className="refresh-btn"
            onClick={handleRefresh}
            data-tooltip={getRefreshConfig().tooltip}
          >
            🔄 {getRefreshConfig().label}
          </button>

          <div
            className="status-indicator"
            data-tooltip={
              connected
                ? "Docker daemon is running and connected"
                : error
                ? `Connection error: ${error}`
                : "Docker daemon is not running or not accessible"
            }
          >
            <div
              className={`status-dot ${connected ? "running" : "stopped"}`}
            ></div>
            <span>
              {connected
                ? "Docker Connected"
                : error
                ? "Docker Error"
                : "Docker Disconnected"}
            </span>
          </div>

          <button
            className="system-info-btn"
            onClick={() => setIsSystemInfoOpen(true)}
            data-tooltip="System Information"
          >
            📊
          </button>
        </div>
      </header>

      <SystemInfoModal
        isOpen={isSystemInfoOpen}
        onClose={() => setIsSystemInfoOpen(false)}
      />
    </>
  )
}
