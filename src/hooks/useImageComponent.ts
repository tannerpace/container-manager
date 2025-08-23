import { useState } from "react"
import type { ContainerConfig } from '../components/ContainerCreateModal'
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

	// Filter images based on search term
	const filteredImages = filterImages(images, searchTerm)
	// Boolean for conditional rendering
	const isAllFiltered = filteredImages.length === 0 && images.length > 0
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

	const handleCreateContainer = async (config: ContainerConfig) => {
		try {
			await createContainerWithConfig(config)
			setCreateModalVisible(false)
			setSelectedImage(null)
		} catch (error) {
			console.error("Failed to create container:", error)
			// Error handling is done in the Docker context
		}
	}

	const handleCloseCreateModal = () => {
		setCreateModalVisible(false)
		setSelectedImage(null)
	}

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
		removeImage,
		refreshImages,
		runContainer,
		createContainerWithConfig,
		createModalVisible,
		setCreateModalVisible,
		selectedImage,
		setSelectedImage,
		filteredImages,
		isAllFiltered,
		handleAction,
		handleCreateContainer,
		handleCloseCreateModal,
		formatBytes,
	}
}
