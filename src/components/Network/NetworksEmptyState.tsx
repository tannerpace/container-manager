interface NetworksEmptyStateProps {
	searchActive?: boolean
}

export function NetworksEmptyState({ searchActive }: NetworksEmptyStateProps) {
	if (searchActive) {
		return (
			<div className="networks-empty">
				<div className="empty-icon">🔍</div>
				<h3>No networks match your search</h3>
				<p>
					Try adjusting your search term or clear the search to see all
					networks.
				</p>
			</div>
		)
	}
	return (
		<div className="empty-state">
			<div className="empty-icon">🌐</div>
			<h3>No networks found</h3>
			<p>Create a network to connect containers</p>
		</div>
	)
}
