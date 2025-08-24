
import { useNetworkComponent } from "../hooks/useNetworkComponent"
import { NetworksEmptyState } from "./Network/NetworksEmptyState"
import { NetworksTable } from "./Network/NetworksTable"
import "./NetworksList.css"


export function NetworksList() {
  const {
    networks,
    loading,
    error,
    filteredNetworks,
    handleRefresh,
  } = useNetworkComponent()


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
        <button
          onClick={handleRefresh}
          className="retry-btn"
          data-tooltip="Retry loading networks"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="networks-list">
      <div className="networks-header">
        <div className="header-content">
          <h2>Networks ({filteredNetworks.length})</h2>
          <div className="header-actions">
            <button
              onClick={handleRefresh}
              className="refresh-btn"
              disabled={loading}
              data-tooltip="Refresh networks list"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {filteredNetworks.length === 0 ? (
        <NetworksEmptyState searchActive={networks.length > 0} />
      ) : (
        <NetworksTable networks={filteredNetworks} />
      )}
    </div>
  )
}
