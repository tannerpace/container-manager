import React, { createContext, useContext, useEffect, useReducer } from "react"
import { getCurrentDockerConfig } from "../config/docker"

// Docker API types
export interface DockerContainer {
  Id: string
  Names: string[]
  Image: string
  ImageID: string
  Command: string
  Created: number
  Ports: Array<{
    IP?: string
    PrivatePort: number
    PublicPort?: number
    Type: string
  }>
  Labels: Record<string, string>
  State: string
  Status: string
  HostConfig: {
    NetworkMode: string
  }
  NetworkSettings: {
    Networks: Record<string, unknown>
  }
  Mounts: Array<{
    Type: string
    Source: string
    Destination: string
    Mode: string
    RW: boolean
    Propagation: string
  }>
}

export interface DockerImage {
  Id: string
  ParentId: string
  RepoTags: string[] | null
  RepoDigests: string[] | null
  Created: number
  Size: number
  VirtualSize: number
  SharedSize: number
  Labels: Record<string, string> | null
  Containers: number
}

export interface DockerVolume {
  CreatedAt: string
  Driver: string
  Labels: Record<string, string> | null
  Mountpoint: string
  Name: string
  Options: Record<string, string> | null
  Scope: string
}

export interface DockerNetwork {
  Name: string
  Id: string
  Created: string
  Scope: string
  Driver: string
  EnableIPv6: boolean
  IPAM: {
    Driver: string
    Options: Record<string, unknown> | null
    Config: Array<{
      Subnet?: string
      Gateway?: string
    }>
  }
  Internal: boolean
  Attachable: boolean
  Ingress: boolean
  ConfigFrom: {
    Network: string
  }
  ConfigOnly: boolean
  Containers: Record<string, unknown>
  Options: Record<string, unknown>
  Labels: Record<string, string>
}

interface DockerState {
  containers: DockerContainer[]
  images: DockerImage[]
  volumes: DockerVolume[]
  networks: DockerNetwork[]
  loading: boolean
  error: string | null
  connected: boolean
  searchTerm: string
}

type DockerAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_CONTAINERS"; payload: DockerContainer[] }
  | { type: "SET_IMAGES"; payload: DockerImage[] }
  | { type: "SET_VOLUMES"; payload: DockerVolume[] }
  | { type: "SET_NETWORKS"; payload: DockerNetwork[] }
  | { type: "SET_SEARCH_TERM"; payload: string }

const initialState: DockerState = {
  containers: [],
  images: [],
  volumes: [],
  networks: [],
  loading: false,
  error: null,
  connected: false,
  searchTerm: "",
}

function dockerReducer(state: DockerState, action: DockerAction): DockerState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "SET_CONNECTED":
      return { ...state, connected: action.payload }
    case "SET_CONTAINERS":
      return { ...state, containers: action.payload, loading: false }
    case "SET_IMAGES":
      return { ...state, images: action.payload, loading: false }
    case "SET_VOLUMES":
      return { ...state, volumes: action.payload, loading: false }
    case "SET_NETWORKS":
      return { ...state, networks: action.payload, loading: false }
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload }
    default:
      return state
  }
}

interface DockerContextType extends DockerState {
  refreshContainers: () => Promise<void>
  refreshImages: () => Promise<void>
  refreshVolumes: () => Promise<void>
  refreshNetworks: () => Promise<void>
  startContainer: (id: string) => Promise<void>
  stopContainer: (id: string) => Promise<void>
  restartContainer: (id: string) => Promise<void>
  pauseContainer: (id: string) => Promise<void>
  unpauseContainer: (id: string) => Promise<void>
  renameContainer: (id: string, name: string) => Promise<void>
  exportContainer: (id: string, tag?: string) => Promise<void>
  removeContainer: (id: string) => Promise<void>
  removeImage: (id: string) => Promise<void>
  setSearchTerm: (term: string) => void
  filterContainers: (
    containers: DockerContainer[],
    searchTerm: string
  ) => DockerContainer[]
  filterImages: (images: DockerImage[], searchTerm: string) => DockerImage[]
  filterVolumes: (volumes: DockerVolume[], searchTerm: string) => DockerVolume[]
  filterNetworks: (
    networks: DockerNetwork[],
    searchTerm: string
  ) => DockerNetwork[]
}

const DockerContext = createContext<DockerContextType | undefined>(undefined)

export function useDocker() {
  const context = useContext(DockerContext)
  if (context === undefined) {
    throw new Error("useDocker must be used within a DockerProvider")
  }
  return context
}

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

  // Search/filter utility functions
  const filterContainers = (
    containers: DockerContainer[],
    searchTerm: string
  ): DockerContainer[] => {
    if (!searchTerm.trim()) return containers
    const term = searchTerm.toLowerCase()
    return containers.filter(
      (container) =>
        container.Names.some((name) => name.toLowerCase().includes(term)) ||
        container.Image.toLowerCase().includes(term) ||
        container.Id.toLowerCase().includes(term) ||
        container.State.toLowerCase().includes(term) ||
        container.Status.toLowerCase().includes(term)
    )
  }

  const filterImages = (
    images: DockerImage[],
    searchTerm: string
  ): DockerImage[] => {
    if (!searchTerm.trim()) return images
    const term = searchTerm.toLowerCase()
    return images.filter(
      (image) =>
        image.Id.toLowerCase().includes(term) ||
        (image.RepoTags &&
          image.RepoTags.some((tag) => tag.toLowerCase().includes(term))) ||
        (image.RepoDigests &&
          image.RepoDigests.some((digest) =>
            digest.toLowerCase().includes(term)
          ))
    )
  }

  const filterVolumes = (
    volumes: DockerVolume[],
    searchTerm: string
  ): DockerVolume[] => {
    if (!searchTerm.trim()) return volumes
    const term = searchTerm.toLowerCase()
    return volumes.filter(
      (volume) =>
        volume.Name.toLowerCase().includes(term) ||
        volume.Driver.toLowerCase().includes(term) ||
        volume.Mountpoint.toLowerCase().includes(term)
    )
  }

  const filterNetworks = (
    networks: DockerNetwork[],
    searchTerm: string
  ): DockerNetwork[] => {
    if (!searchTerm.trim()) return networks
    const term = searchTerm.toLowerCase()
    return networks.filter(
      (network) =>
        network.Name.toLowerCase().includes(term) ||
        network.Id.toLowerCase().includes(term) ||
        network.Driver.toLowerCase().includes(term) ||
        network.Scope.toLowerCase().includes(term)
    )
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

  const setSearchTerm = (term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term })
  }

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
