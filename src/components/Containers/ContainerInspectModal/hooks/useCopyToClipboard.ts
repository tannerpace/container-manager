import { useState } from "react"

/**
 * Custom hook to handle copying text to clipboard with success feedback.
 */
export function useCopyToClipboard() {
	const [copySuccess, setCopySuccess] = useState(false)

	const copy = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text)
			setCopySuccess(true)
			setTimeout(() => setCopySuccess(false), 2000)
		} catch (err) {
			console.error("Failed to copy to clipboard:", err)
		}
	}

	return { copySuccess, copy }
}
