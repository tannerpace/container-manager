import { useCallback, useMemo } from "react"
import { useDocker } from "../hooks/useDocker"
import { filterNetworks } from "../utils/dockerFilters"

/**
 * Custom hook for Docker network list logic (filtering, refresh, error/loading states)
 */
export function useNetworkComponent() {
	const {
		networks,
		loading,
		error,
		searchTerm,
		refreshNetworks,
	} = useDocker()

	const filteredNetworks = useMemo(
		() => filterNetworks(networks, searchTerm),
		[networks, searchTerm]
	)

	const handleRefresh = useCallback(async () => {
		await refreshNetworks()
	}, [refreshNetworks])

	return {
		networks,
		loading,
		error,
		filteredNetworks,
		handleRefresh,
	}
}
