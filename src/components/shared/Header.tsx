import { useState } from "react"
import { useLocation } from "react-router-dom"
// import whaleSvg from "../assets/whaley.svg"
import { useDocker } from "../../hooks/useDocker"

import "../Header.css"
import { SystemInfoModal } from "./SystemInfoModal"

export function Header() {
  const location = useLocation()
  const {
    connected,
    error,
    searchTerm,
    setSearchTerm,
    refreshContainers,
    refreshImages,
    refreshVolumes,
    refreshNetworks,
    containers,
    images,
    volumes,
    networks,
    filterContainers,
    filterImages,
    filterVolumes,
    filterNetworks
  } = useDocker()
  const [isSystemInfoOpen, setIsSystemInfoOpen] = useState(false)

  const getPageInfo = () => {
    const path = location.pathname

    // Don't show page info on detail pages
    if (path.includes('_details') || path.includes('_detail')) {
      return {
        title: '',
        count: 0
      }
    }

    if (path === '/' || path === '/containers') {
      const filtered = filterContainers(containers, searchTerm)
      return {
        title: 'Containers',
        count: filtered.length
      }
    } else if (path === '/images') {
      const filtered = filterImages(images, searchTerm)
      return {
        title: 'Images',
        count: filtered.length
      }
    } else if (path === '/volumes') {
      const filtered = filterVolumes(volumes, searchTerm)
      return {
        title: 'Volumes',
        count: filtered.length
      }
    } else if (path === '/networks') {
      const filtered = filterNetworks(networks, searchTerm)
      return {
        title: 'Networks',
        count: filtered.length
      }
    } else {
      return {
        title: '',
        count: 0
      }
    }
  }

  const pageInfo = getPageInfo()

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
         {pageInfo.title && (
           <div className="page-info">
             <h2>{pageInfo.title} ({pageInfo.count})</h2>
           </div>
         )}
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
