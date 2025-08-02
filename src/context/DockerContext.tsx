import React, { useEffect, useReducer } from "react"
import { getCurrentDockerConfig } from "../config/docker"
import type { DockerContextType } from "../types/dockerTypes"
import {
  filterContainers,
  filterImages,
  filterNetworks,
  filterVolumes,
} from "../utils/dockerFilters"
import { dockerReducer, initialState } from "../utils/dockerReducer"
import { DockerContext } from "./DockerContextDefinition"

interface DockerProviderProps {
  children: React.ReactNode
}

export function DockerProvider({ children }: DockerProviderProps) {
  const [state, dispatch] = useReducer(dockerReducer, initialState)

  // Docker API configuration
  const dockerConfig = getCurrentDockerConfig()
  const DOCKER_API_BASE = dockerConfig.apiUrl

  // Helper function to make Docker API calls
  const makeDockerAPICall = async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    try {
      const response = await fetch(`${DOCKER_API_BASE}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(
          `Docker API error: ${response.status} ${response.statusText}`
        )
      }

      // Handle empty responses
      const text = await response.text()
      if (!text || text.trim() === "") {
        // Return empty array for JSON responses that should contain arrays
        return []
      }

      try {
        return JSON.parse(text)
      } catch (parseError) {
        console.error("Failed to parse JSON response:", text, parseError)
        throw new Error("Invalid JSON response from Docker API")
      }
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          throw new Error(
            "Unable to connect to Docker daemon. Make sure Docker is running and API is accessible."
          )
        }
      }
      throw error
    }
  }

  // Real Docker API calls
  const refreshContainers = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Fetch all containers (including stopped ones)
      const containers = await makeDockerAPICall("/containers/json?all=true")
      dispatch({ type: "SET_CONTAINERS", payload: containers })
      dispatch({ type: "SET_CONNECTED", payload: true })
      dispatch({ type: "SET_ERROR", payload: null })
    } catch (error) {
      console.error("Error fetching containers:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
      dispatch({ type: "SET_CONNECTED", payload: false })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const refreshImages = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Fetch all images
      const images = await makeDockerAPICall("/images/json")
      dispatch({ type: "SET_IMAGES", payload: images })
      dispatch({ type: "SET_ERROR", payload: null })
    } catch (error) {
      console.error("Error fetching images:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const refreshVolumes = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Fetch all volumes
      const volumesResponse = await makeDockerAPICall("/volumes")
      const volumes = volumesResponse.Volumes || []
      dispatch({ type: "SET_VOLUMES", payload: volumes })
      dispatch({ type: "SET_ERROR", payload: null })
    } catch (error) {
      console.error("Error fetching volumes:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const refreshNetworks = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Fetch all networks
      const networks = await makeDockerAPICall("/networks")
      dispatch({ type: "SET_NETWORKS", payload: networks })
      dispatch({ type: "SET_ERROR", payload: null })
    } catch (error) {
      console.error("Error fetching networks:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const startContainer = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(`/containers/${id}/start`, { method: "POST" })
      // Refresh containers to get updated status
      await refreshContainers()
    } catch (error) {
      console.error("Error starting container:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const stopContainer = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(`/containers/${id}/stop`, { method: "POST" })
      // Refresh containers to get updated status
      await refreshContainers()
    } catch (error) {
      console.error("Error stopping container:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const restartContainer = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(`/containers/${id}/restart`, { method: "POST" })
      // Refresh containers to get updated status
      await refreshContainers()
    } catch (error) {
      console.error("Error restarting container:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const pauseContainer = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(`/containers/${id}/pause`, { method: "POST" })
      // Refresh containers to get updated status
      await refreshContainers()
    } catch (error) {
      console.error("Error pausing container:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const unpauseContainer = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(`/containers/${id}/unpause`, { method: "POST" })
      // Refresh containers to get updated status
      await refreshContainers()
    } catch (error) {
      console.error("Error unpausing container:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const renameContainer = async (id: string, name: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(
        `/containers/${id}/rename?name=${encodeURIComponent(name)}`,
        {
          method: "POST",
        }
      )
      // Refresh containers to get updated names
      await refreshContainers()
    } catch (error) {
      console.error("Error renaming container:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const exportContainer = async (id: string, tag?: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Commit container to create an image
      const imageTag = tag || `container-export-${Date.now()}`
      await makeDockerAPICall(`/commit?container=${id}&repo=${imageTag}`, {
        method: "POST",
      })
      // Refresh images to show the new export
      await refreshImages()
    } catch (error) {
      console.error("Error exporting container:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const removeContainer = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(`/containers/${id}`, { method: "DELETE" })
      // Refresh containers to get updated list
      await refreshContainers()
    } catch (error) {
      console.error("Error removing container:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const removeImage = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(`/images/${id}`, { method: "DELETE" })
      // Refresh images to get updated list
      await refreshImages()
    } catch (error) {
      console.error("Error removing image:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const createContainer = async (imageId: string, containerName?: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const createConfig = {
        Image: imageId,
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        OpenStdin: false,
        StdinOnce: false,
        ...(containerName && { name: containerName }),
      }

      await makeDockerAPICall("/containers/create", {
        method: "POST",
        body: JSON.stringify(createConfig),
      })

      // Refresh containers to get updated list
      await refreshContainers()
    } catch (error) {
      console.error("Error creating container:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const runContainer = async (imageId: string, containerName?: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const createConfig = {
        Image: imageId,
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        OpenStdin: false,
        StdinOnce: false,
        ...(containerName && { name: containerName }),
      }

      const response = await makeDockerAPICall("/containers/create", {
        method: "POST",
        body: JSON.stringify(createConfig),
      })

      const containerId = response.Id

      // Start the container
      await makeDockerAPICall(`/containers/${containerId}/start`, {
        method: "POST",
      })

      // Refresh containers to get updated list
      await refreshContainers()
    } catch (error) {
      console.error("Error running container:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  // Search/filter utility functions
  const setSearchTerm = (term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term })
  }

  useEffect(() => {
    // Initialize data on mount
    const initializeData = async () => {
      await refreshContainers()
      await refreshImages()
      await refreshVolumes()
      await refreshNetworks()
    }

    initializeData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue: DockerContextType = {
    ...state,
    refreshContainers,
    refreshImages,
    refreshVolumes,
    refreshNetworks,
    startContainer,
    stopContainer,
    restartContainer,
    pauseContainer,
    unpauseContainer,
    renameContainer,
    exportContainer,
    removeContainer,
    removeImage,
    createContainer,
    runContainer,
    setSearchTerm,
    filterContainers,
    filterImages,
    filterVolumes,
    filterNetworks,
  }

  return (
    <DockerContext.Provider value={contextValue}>
      {children}
    </DockerContext.Provider>
  )
}
