import type { DockerNetwork } from "../../types/dockerTypes"

interface NetworkRowProps {
	network: DockerNetwork
	onRemove?: (id: string) => void
}

export function NetworkRow({ network, onRemove }: NetworkRowProps) {
	return (
		<div className="table-row">
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
						data-tooltip="Remove network"
						onClick={() => onRemove?.(network.Id)}
					>
						🗑️
					</button>
				</div>
			</div>
		</div>
	)
}
