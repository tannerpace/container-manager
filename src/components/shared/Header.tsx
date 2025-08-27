import { useState } from "react"
// import whaleSvg from "../assets/whaley.svg"
import { useDocker } from "../../hooks/useDocker"

import "./Header.css"
import { SystemInfoModal } from "./SystemInfoModal"

export function Header() {
  const { connected, error, searchTerm, setSearchTerm } = useDocker()
  const [isSystemInfoOpen, setIsSystemInfoOpen] = useState(false)

  return (
    <>
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              🐳
            </div>
            <h1>Whale Tracker</h1>
          </div>
        </div>

        <div className="header-center">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search containers, images..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="header-right">
          <div className="status-indicator">
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
