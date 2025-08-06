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

  const createContainerWithConfig = async (config: {
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
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Build the Docker container creation configuration
      interface DockerCreateConfig {
        Image: string
        AttachStdin: boolean
        AttachStdout: boolean
        AttachStderr: boolean
        Tty: boolean
        OpenStdin: boolean
        StdinOnce: boolean
        name?: string
        ExposedPorts?: Record<string, object>
        Env?: string[]
        WorkingDir?: string
        Cmd?: string[]
        Entrypoint?: string[]
        HostConfig?: DockerHostConfig
      }

      interface DockerHostConfig {
        Memory?: number
        MemorySwap?: number
        NanoCpus?: number
        CpuShares?: number
        Binds?: string[]
        PortBindings?: Record<string, Array<{ HostPort: string }>>
        NetworkMode?: string
        RestartPolicy?: {
          Name: string
          MaximumRetryCount: number
        }
        AutoRemove?: boolean
      }

      const createConfig: DockerCreateConfig = {
        Image: config.image,
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        OpenStdin: false,
        StdinOnce: false,
      }

      // Add name if provided
      if (config.name) {
        createConfig.name = config.name
      }

      // Add resource limits
      const hostConfig: DockerHostConfig = {}
      if (config.memory) {
        hostConfig.Memory = config.memory * 1024 * 1024 // Convert MB to bytes
      }
      if (config.memorySwap) {
        hostConfig.MemorySwap = config.memorySwap * 1024 * 1024 // Convert MB to bytes
      }
      if (config.cpus) {
        hostConfig.NanoCpus = config.cpus * 1000000000 // Convert to nanocpus
      }
      if (config.cpuShares) {
        hostConfig.CpuShares = config.cpuShares
      }

      // Add volumes
      if (config.volumes && config.volumes.length > 0) {
        hostConfig.Binds = config.volumes.map(
          (vol) => `${vol.host}:${vol.container}:${vol.mode}`
        )
      }

      // Add port mappings
      if (config.ports && config.ports.length > 0) {
        hostConfig.PortBindings = {}
        createConfig.ExposedPorts = {}

        config.ports.forEach((port) => {
          const containerPort = `${port.container}/${port.protocol}`
          createConfig.ExposedPorts![containerPort] = {}
          hostConfig.PortBindings![containerPort] = [
            { HostPort: port.host.toString() },
          ]
        })
      }

      // Add network mode
      if (config.networkMode) {
        hostConfig.NetworkMode = config.networkMode
      }

      // Add restart policy
      if (config.restart && config.restart !== "no") {
        hostConfig.RestartPolicy = {
          Name: config.restart,
          MaximumRetryCount: config.restart === "on-failure" ? 3 : 0,
        }
      }

      // Add auto remove
      if (config.autoRemove) {
        hostConfig.AutoRemove = true
      }

      // Add host config to main config
      if (Object.keys(hostConfig).length > 0) {
        createConfig.HostConfig = hostConfig
      }

      // Add environment variables
      if (config.environment && config.environment.length > 0) {
        createConfig.Env = config.environment.map(
          (env) => `${env.key}=${env.value}`
        )
      }

      // Add working directory
      if (config.workingDir) {
        createConfig.WorkingDir = config.workingDir
      }

      // Add command
      if (config.command) {
        createConfig.Cmd = config.command.split(" ")
      }

      // Add entrypoint
      if (config.entrypoint) {
        createConfig.Entrypoint = config.entrypoint.split(" ")
      }

      // Create the container
      const response = await makeDockerAPICall("/containers/create", {
        method: "POST",
        body: JSON.stringify(createConfig),
      })

      // Refresh containers to get updated list
      await refreshContainers()

      return response
    } catch (error) {
      console.error("Error creating container with config:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    } finally {
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

  const openTerminal = async (containerId: string) => {
    try {
      // For now, we'll open a new browser tab/window to a terminal interface
      // In a real implementation, this would open a WebSocket-based terminal
      const terminalUrl = `/terminal/${containerId}`
      window.open(
        terminalUrl,
        "_blank",
        "width=800,height=600,scrollbars=yes,resizable=yes"
      )

      // Alternative: For now, show alert with instructions
      alert(
        `Terminal access for container ${containerId}\n\nIn a full implementation, this would open an interactive terminal.\n\nFor now, you can use:\n\`docker exec -it ${containerId} /bin/sh\``
      )
    } catch (error) {
      console.error("Error opening terminal:", error)
      alert("Failed to open terminal connection")
    }
  }

  const copyContainer = async (
    containerId: string,
    newContainerName?: string
  ) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Get the original container details
      const containerDetails = await makeDockerAPICall(
        `/containers/${containerId}/json`
      )

      // Generate a new container name if not provided
      const originalName = containerDetails.Name.replace("/", "")
      const finalName = newContainerName || `${originalName}_copy_${Date.now()}`

      // Create the new container from the same image with similar config
      const createConfig = {
        Image: containerDetails.Config.Image,
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        OpenStdin: false,
        StdinOnce: false,
        // Copy some basic configuration
        Env: containerDetails.Config.Env,
        Cmd: containerDetails.Config.Cmd,
        WorkingDir: containerDetails.Config.WorkingDir,
        ExposedPorts: containerDetails.Config.ExposedPorts,
        name: finalName,
      }

      await makeDockerAPICall("/containers/create", {
        method: "POST",
        body: JSON.stringify(createConfig),
      })

      // Refresh containers to show the new container
      await refreshContainers()
    } catch (error) {
      console.error("Error copying container:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
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
    createContainerWithConfig,
    runContainer,
    copyContainer,
    openTerminal,
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
