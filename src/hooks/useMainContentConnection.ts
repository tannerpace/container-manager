import { useState } from "react"
import { useDocker } from "./useDocker"

/**
 * Custom hook to encapsulate Docker connection and setup guide state for MainContent.
 */
export function useMainContentConnection() {
	const { connected, error } = useDocker()
	const [showSetupGuide, setShowSetupGuide] = useState(false)

	const shouldShowSetupGuide =
		!connected && error && error.includes("Unable to connect to Docker daemon")

	return {
		shouldShowSetupGuide,
		showSetupGuide,
		setShowSetupGuide,
	}
}
