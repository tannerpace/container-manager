import { useState } from "react"
import type { DockerImage } from "../types/dockerTypes"
import { useDocker } from "./useDocker"

/**
 * Custom hook for managing Docker image actions and modal state.
 */
export function useImageComponent() {
	const {
		images,
		loading,
		error,
		searchTerm,
		filterImages,
		removeImage,
		refreshImages,
		runContainer,
		createContainerWithConfig,
	} = useDocker()

	// Container creation modal state
	const [createModalVisible, setCreateModalVisible] = useState(false)
	const [selectedImage, setSelectedImage] = useState<DockerImage | null>(null)

	/**
	 * Handles actions on images (remove, run, create, refresh).
	 * @param action Action type
	 * @param imageId Docker image ID
	 */
	const handleAction = async (action: string, imageId: string) => {
		switch (action) {
			case "remove":
				if (confirm("Are you sure you want to remove this image?")) {
					await removeImage(imageId)
				}
				break
			case "run":
				try {
					await runContainer(imageId)
				} catch (error) {
					console.error("Error running container:", error)
					alert("Failed to create and run container from this image")
				}
				break
			case "create": {
				const image = images.find((img) => img.Id === imageId)
				if (image) {
					setSelectedImage(image)
					setCreateModalVisible(true)
				}
				break
			}
			case "refresh":
				await refreshImages()
				break
		}
	}

	/**
	 * Handles container creation from modal.
	 * @param config Container configuration
	 */
	const handleCreateContainer = async (config: {
		image: string
		name?: string
		memory?: number
		memorySwap?: number
		cpus?: number
		cpuShares?: number
		volumes?: { host: string; container: string; mode: "ro" | "rw" }[]
		ports?: { host: number; container: number; protocol: "tcp" | "udp" }[]
		networkMode?: string
		environment?: { key: string; value: string }[]
		workingDir?: string
		command?: string
		entrypoint?: string
		restart?: "no" | "always" | "unless-stopped" | "on-failure"
		autoRemove?: boolean
	}) => {
		try {
			await createContainerWithConfig(config)
			setCreateModalVisible(false)
			setSelectedImage(null)
		} catch (error) {
			console.error("Failed to create container:", error)
			// Error handling is done in the Docker context
		}
	}

	/**
	 * Closes the container creation modal.
	 */
	const handleCloseCreateModal = () => {
		setCreateModalVisible(false)
		setSelectedImage(null)
	}

	/**
	 * Formats bytes as human-readable string.
	 * @param bytes Number of bytes
	 * @returns Formatted string
	 */
	const formatBytes = (bytes: number) => {
		if (bytes === 0) return "0 Bytes"
		const k = 1024
		const sizes = ["Bytes", "KB", "MB", "GB"]
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
	}

	return {
		images,
		loading,
		error,
		searchTerm,
		filterImages,
		createModalVisible,
		selectedImage,
		handleAction,
		handleCreateContainer,
		handleCloseCreateModal,
		formatBytes,
		removeImage,
		refreshImages,
		runContainer,
		createContainerWithConfig,
	}
}
