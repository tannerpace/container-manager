import { useDocker } from '../context/DockerContext'

export function NetworksList() {
  const { networks, loading, error, refreshNetworks } = useDocker()

  const handleRefresh = async () => {
    await refreshNetworks()
  }

  if (loading && networks.length === 0) {
    return (
      <div className="networks-loading">
        <div className="loading-spinner"></div>
        <p>Loading networks...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="networks-error">
        <h3>Error loading networks</h3>
        <p>{error}</p>
        <button onClick={handleRefresh} className="retry-btn">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="networks-list">
      <div className="networks-header">
        <div className="header-content">
          <h2>Networks ({networks.length})</h2>
          <div className="header-actions">
            <button 
              onClick={handleRefresh} 
              className="refresh-btn"
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {networks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌐</div>
          <h3>No networks found</h3>
          <p>Create a network to connect containers</p>
        </div>
      ) : (
        <div className="networks-table">
          <div className="table-header">
            <div className="col-name">Network Name</div>
            <div className="col-id">Network ID</div>
            <div className="col-driver">Driver</div>
            <div className="col-scope">Scope</div>
            <div className="col-created">Created</div>
            <div className="col-actions">Actions</div>
          </div>
          
          {networks.map((network) => (
            <div key={network.Id} className="table-row">
              <div className="col-name">
                <div className="network-name">{network.Name}</div>
              </div>
              
              <div className="col-id">
                <span className="network-id">{network.Id.substring(0, 12)}</span>
              </div>
              
              <div className="col-driver">
                <span className="network-driver">{network.Driver}</span>
              </div>
              
              <div className="col-scope">
                <span className="network-scope">{network.Scope}</span>
              </div>
              
              <div className="col-created">
                {new Date(network.Created).toLocaleDateString()}
              </div>
              
              <div className="col-actions">
                <div className="action-buttons">
                  <button
                    className="action-btn remove-btn"
                    title="Remove network"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
