import './Header.css'

export function Header() {
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
          <div className="status-dot running"></div>
          <span>Docker Running</span>
        </div>
        
        <button className="settings-btn" title="Settings">
          ⚙️
        </button>
      </div>
    </header>
  )
}
