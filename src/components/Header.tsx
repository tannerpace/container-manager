import { useDocker } from '../context/DockerContext'
import './Header.css'

export function Header() {
  const { connected, error } = useDocker()

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <div className="logo-icon">🐳</div>
          <h1>Container Manager</h1>
        </div>
      </div>
      
      <div className="header-center">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search containers, images..."
            className="search-input"
          />
        </div>
      </div>
      
      <div className="header-right">
        <div className="status-indicator">
          <div className={`status-dot ${connected ? 'running' : 'stopped'}`}></div>
          <span>{connected ? 'Docker Connected' : error ? 'Docker Error' : 'Docker Disconnected'}</span>
        </div>
        
        <button className="settings-btn" title="Settings">
          ⚙️
        </button>
      </div>
    </header>
  )
}
