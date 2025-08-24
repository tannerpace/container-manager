import { useCallback, useEffect, useState } from "react"
import { dockerAPI } from "../../../api/dockerClient"
import type { DockerContainerDetails } from "../../../types/dockerTypes"

/**
 * Custom hook to fetch and manage Docker container details.
 * Handles loading, error, and retry logic.
 */
export function useContainerDetails(containerId: string, isVisible: boolean) {
	const [containerDetails, setContainerDetails] = useState<DockerContainerDetails | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const loadContainerDetails = useCallback(async () => {
		if (!containerId) return
		try {
			setLoading(true)
			setError(null)
			const details = await dockerAPI.inspectContainer(containerId)
			setContainerDetails(details)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load container details")
		} finally {
			setLoading(false)
		}
	}, [containerId])

	useEffect(() => {
		if (isVisible && containerId) {
			loadContainerDetails()
		}
	}, [isVisible, containerId, loadContainerDetails])

	return { containerDetails, loading, error, loadContainerDetails }
}
