import React, { useCallback, useEffect, useReducer } from "react"
import { dockerAPI } from "../api/dockerClient"
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

  const dockerConfig = getCurrentDockerConfig()
  const DOCKER_API_BASE = dockerConfig.apiUrl

  /**
   * Makes HTTP requests to the Docker API with proper error handling
   * @param endpoint - The API endpoint to call
   * @param options - Fetch options for the request
   * @returns Promise with the parsed JSON response
   */
  const makeDockerAPICall = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
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

        const text = await response.text()
        if (!text || text.trim() === "") {
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
    },
    [DOCKER_API_BASE]
  )

  /**
   * Fetches all containers from Docker API and updates the state
   */
  const refreshContainers = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
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
  }, [makeDockerAPICall])

  /**
   * Fetches all Docker images and updates the state
   */
  const refreshImages = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
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
  }, [makeDockerAPICall])

  /**
   * Fetches all Docker volumes and updates the state
   */
  const refreshVolumes = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
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
  }, [makeDockerAPICall])

  /**
   * Fetches all Docker networks and updates the state
   */
  const refreshNetworks = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
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
  }, [makeDockerAPICall])

  const refreshSystemUsage = useCallback(async () => {
    console.log("🔄 DockerContext: Starting system usage refresh...")
    try {
      const systemUsageResponse = await dockerAPI.getRealSystemUsage()
      console.log(
        "✅ DockerContext: Received system usage data:",
        systemUsageResponse
      )

      const systemUsage = {
        ...systemUsageResponse,
        lastUpdated: new Date(),
      }

      console.log(
        "📊 DockerContext: Dispatching system usage to state:",
        systemUsage
      )
      dispatch({ type: "SET_SYSTEM_USAGE", payload: systemUsage })
    } catch (error) {
      console.error("❌ DockerContext: Error getting real system usage:", error)

      // Fallback to zero values if real monitoring fails
      const now = new Date()
      const fallbackUsage = {
        cpuPercent: 0,
        memoryUsed: 0,
        memoryTotal: 0,
        memoryPercent: 0,
        lastUpdated: now,
      }

      console.log(
        "🔄 DockerContext: Using fallback system usage:",
        fallbackUsage
      )
      dispatch({ type: "SET_SYSTEM_USAGE", payload: fallbackUsage })
    }
  }, [])

  /**
   * Fetches Docker system information and updates the state
   */
  const refreshSystemInfo = useCallback(async () => {
    try {
      const systemInfo = await makeDockerAPICall("/info")
      dispatch({ type: "SET_SYSTEM_INFO", payload: systemInfo })
    } catch (error) {
      console.error("Error fetching system info:", error)
      dispatch({ type: "SET_SYSTEM_INFO", payload: null })
    }
  }, [makeDockerAPICall])

  /**
   * Starts a Docker container by ID
   * @param id - Container ID or name
   */
  const startContainer = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(`/containers/${id}/start`, { method: "POST" })
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

  /**
   * Stops a Docker container by ID
   * @param id - Container ID or name
   */
  const stopContainer = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(`/containers/${id}/stop`, { method: "POST" })
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

  /**
   * Restarts a Docker container by ID
   * @param id - Container ID or name
   */
  const restartContainer = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(`/containers/${id}/restart`, { method: "POST" })
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

  /**
   * Pauses a Docker container by ID
   * @param id - Container ID or name
   */
  const pauseContainer = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(`/containers/${id}/pause`, { method: "POST" })
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

  /**
   * Unpauses a Docker container by ID
   * @param id - Container ID or name
   */
  const unpauseContainer = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(`/containers/${id}/unpause`, { method: "POST" })
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

  /**
   * Renames a Docker container
   * @param id - Container ID or name
   * @param name - New name for the container
   */
  const renameContainer = async (id: string, name: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(
        `/containers/${id}/rename?name=${encodeURIComponent(name)}`,
        {
          method: "POST",
        }
      )
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

  /**
   * Exports a container by committing it to an image
   * @param id - Container ID or name
   * @param tag - Optional tag for the exported image
   */
  const exportContainer = async (id: string, tag?: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const imageTag = tag || `container-export-${Date.now()}`
      await makeDockerAPICall(`/commit?container=${id}&repo=${imageTag}`, {
        method: "POST",
      })
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

  /**
   * Removes a Docker container by ID
   * @param id - Container ID or name
   */
  const removeContainer = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(`/containers/${id}`, { method: "DELETE" })
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

  /**
   * Removes a Docker image by ID
   * @param id - Image ID or name
   */
  const removeImage = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await makeDockerAPICall(`/images/${id}`, { method: "DELETE" })
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

  /**
   * Creates a new Docker container from an image
   * @param imageId - Image ID or name to create container from
   * @param containerName - Optional name for the new container
   */
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

  /**
   * Creates a Docker container with advanced configuration options
   * @param config - Container configuration object with various options
   * @returns Promise with the created container response
   */
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

      if (config.name) {
        createConfig.name = config.name
      }

      const hostConfig: DockerHostConfig = {}
      if (config.memory) {
        hostConfig.Memory = config.memory * 1024 * 1024
      }
      if (config.memorySwap) {
        hostConfig.MemorySwap = config.memorySwap * 1024 * 1024
      }
      if (config.cpus) {
        hostConfig.NanoCpus = config.cpus * 1000000000
      }
      if (config.cpuShares) {
        hostConfig.CpuShares = config.cpuShares
      }

      if (config.volumes && config.volumes.length > 0) {
        hostConfig.Binds = config.volumes.map(
          (vol) => `${vol.host}:${vol.container}:${vol.mode}`
        )
      }

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

      if (config.networkMode) {
        hostConfig.NetworkMode = config.networkMode
      }

      if (config.restart && config.restart !== "no") {
        hostConfig.RestartPolicy = {
          Name: config.restart,
          MaximumRetryCount: config.restart === "on-failure" ? 3 : 0,
        }
      }

      if (config.autoRemove) {
        hostConfig.AutoRemove = true
      }

      if (Object.keys(hostConfig).length > 0) {
        createConfig.HostConfig = hostConfig
      }

      if (config.environment && config.environment.length > 0) {
        createConfig.Env = config.environment.map(
          (env) => `${env.key}=${env.value}`
        )
      }

      if (config.workingDir) {
        createConfig.WorkingDir = config.workingDir
      }

      if (config.command) {
        createConfig.Cmd = config.command.split(" ")
      }

      if (config.entrypoint) {
        createConfig.Entrypoint = config.entrypoint.split(" ")
      }

      const response = await makeDockerAPICall("/containers/create", {
        method: "POST",
        body: JSON.stringify(createConfig),
      })

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

  /**
   * Creates and immediately starts a Docker container from an image
   * @param imageId - Image ID or name to create container from
   * @param containerName - Optional name for the new container
   */
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

      await makeDockerAPICall(`/containers/${containerId}/start`, {
        method: "POST",
      })

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

  /**
   * Opens a terminal connection to a container
   * @param containerId - Container ID to connect to
   */
  const openTerminal = async (containerId: string) => {
    try {
      const terminalUrl = `/terminal/${containerId}`
      window.open(
        terminalUrl,
        "_blank",
        "width=800,height=600,scrollbars=yes,resizable=yes"
      )

      alert(
        `Terminal access for container ${containerId}\n\nIn a full implementation, this would open an interactive terminal.\n\nFor now, you can use:\n\`docker exec -it ${containerId} /bin/sh\``
      )
    } catch (error) {
      console.error("Error opening terminal:", error)
      alert("Failed to open terminal connection")
    }
  }

  /**
   * Creates a copy of an existing container
   * @param containerId - Container ID to copy
   * @param newContainerName - Optional name for the new container
   */
  const copyContainer = async (
    containerId: string,
    newContainerName?: string
  ) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const containerDetails = await makeDockerAPICall(
        `/containers/${containerId}/json`
      )

      const originalName = containerDetails.Name.replace("/", "")
      const finalName = newContainerName || `${originalName}_copy_${Date.now()}`

      const createConfig = {
        Image: containerDetails.Config.Image,
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        OpenStdin: false,
        StdinOnce: false,
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

  /**
   * Sets the search term for filtering resources
   * @param term - Search term to filter by
   */
  const setSearchTerm = (term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term })
  }

  useEffect(() => {
    const initializeData = async () => {
      await refreshContainers()
      await refreshImages()
      await refreshVolumes()
      await refreshNetworks()
    }

    initializeData()
  }, [refreshContainers, refreshImages, refreshVolumes, refreshNetworks])

  // Set up periodic system monitoring
  useEffect(() => {
    let systemStatsInterval: NodeJS.Timeout

    const startSystemMonitoring = async () => {
      console.log("🚀 DockerContext: Starting system monitoring...")
      // Initial fetch of system info
      await refreshSystemInfo()
      await refreshSystemUsage()

      console.log(
        "⏰ DockerContext: Setting up 5-second system usage interval..."
      )
      // Set up periodic updates every 5 seconds
      systemStatsInterval = setInterval(async () => {
        console.log("🔄 DockerContext: Periodic system usage refresh...")
        await refreshSystemUsage()
      }, 5000)
    }

    if (state.connected) {
      console.log(
        "✅ DockerContext: Docker is connected, starting system monitoring..."
      )
      startSystemMonitoring()
    } else {
      console.log(
        "❌ DockerContext: Docker not connected, skipping system monitoring..."
      )
    }

    return () => {
      if (systemStatsInterval) {
        clearInterval(systemStatsInterval)
      }
    }
  }, [state.connected, refreshSystemInfo, refreshSystemUsage])

  const contextValue: DockerContextType = {
    ...state,
    refreshContainers,
    refreshImages,
    refreshVolumes,
    refreshNetworks,
    refreshSystemUsage,
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
