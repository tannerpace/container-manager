import type { DockerNetwork } from "../../types/dockerTypes"
import { NetworkRow } from "./NetworkRow"

interface NetworksTableProps {
	networks: DockerNetwork[]
	onRemove?: (id: string) => void
}

export function NetworksTable({ networks, onRemove }: NetworksTableProps) {
	return (
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
				<NetworkRow key={network.Id} network={network} onRemove={onRemove} />
			))}
		</div>
	)
}
