import React, { createContext, useContext, useEffect, useReducer } from 'react'

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
}

type DockerAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_CONTAINERS'; payload: DockerContainer[] }
  | { type: 'SET_IMAGES'; payload: DockerImage[] }
  | { type: 'SET_VOLUMES'; payload: DockerVolume[] }
  | { type: 'SET_NETWORKS'; payload: DockerNetwork[] }

const initialState: DockerState = {
  containers: [],
  images: [],
  volumes: [],
  networks: [],
  loading: false,
  error: null,
  connected: false,
}

function dockerReducer(state: DockerState, action: DockerAction): DockerState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_CONNECTED':
      return { ...state, connected: action.payload }
    case 'SET_CONTAINERS':
      return { ...state, containers: action.payload, loading: false }
    case 'SET_IMAGES':
      return { ...state, images: action.payload, loading: false }
    case 'SET_VOLUMES':
      return { ...state, volumes: action.payload, loading: false }
    case 'SET_NETWORKS':
      return { ...state, networks: action.payload, loading: false }
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
  removeContainer: (id: string) => Promise<void>
  removeImage: (id: string) => Promise<void>
}

const DockerContext = createContext<DockerContextType | undefined>(undefined)

export function useDocker() {
  const context = useContext(DockerContext)
  if (context === undefined) {
    throw new Error('useDocker must be used within a DockerProvider')
  }
  return context
}

interface DockerProviderProps {
  children: React.ReactNode
}

export function DockerProvider({ children }: DockerProviderProps) {
  const [state, dispatch] = useReducer(dockerReducer, initialState)

  // Mock Docker API calls for now - replace with actual Docker API calls
  const refreshContainers = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Mock containers data
      const mockContainers: DockerContainer[] = [
        {
          Id: '1234567890abcdef',
          Names: ['/my-app'],
          Image: 'nginx:latest',
          ImageID: 'sha256:abc123',
          Command: 'nginx -g "daemon off;"',
          Created: Date.now() / 1000,
          Ports: [{ PrivatePort: 80, PublicPort: 8080, Type: 'tcp' }],
          Labels: {},
          State: 'running',
          Status: 'Up 2 hours',
          HostConfig: { NetworkMode: 'default' },
          NetworkSettings: { Networks: {} },
          Mounts: [],
        },
      ]
      dispatch({ type: 'SET_CONTAINERS', payload: mockContainers })
      dispatch({ type: 'SET_CONNECTED', payload: true })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const refreshImages = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Mock images data
      const mockImages: DockerImage[] = [
        {
          Id: 'sha256:abc123def456',
          ParentId: '',
          RepoTags: ['nginx:latest'],
          RepoDigests: null,
          Created: Date.now() / 1000,
          Size: 142000000,
          VirtualSize: 142000000,
          SharedSize: 0,
          Labels: null,
          Containers: 1,
        },
      ]
      dispatch({ type: 'SET_IMAGES', payload: mockImages })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const refreshVolumes = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Mock volumes data
      const mockVolumes: DockerVolume[] = [
        {
          CreatedAt: new Date().toISOString(),
          Driver: 'local',
          Labels: null,
          Mountpoint: '/var/lib/docker/volumes/my-volume/_data',
          Name: 'my-volume',
          Options: null,
          Scope: 'local',
        },
      ]
      dispatch({ type: 'SET_VOLUMES', payload: mockVolumes })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const refreshNetworks = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Mock networks data
      const mockNetworks: DockerNetwork[] = [
        {
          Name: 'bridge',
          Id: 'abc123def456',
          Created: new Date().toISOString(),
          Scope: 'local',
          Driver: 'bridge',
          EnableIPv6: false,
          IPAM: {
            Driver: 'default',
            Options: null,
            Config: [{ Subnet: '172.17.0.0/16', Gateway: '172.17.0.1' }],
          },
          Internal: false,
          Attachable: false,
          Ingress: false,
          ConfigFrom: { Network: '' },
          ConfigOnly: false,
          Containers: {},
          Options: {},
          Labels: {},
        },
      ]
      dispatch({ type: 'SET_NETWORKS', payload: mockNetworks })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const startContainer = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Mock container start
      console.log(`Starting container ${id}`)
      await refreshContainers()
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const stopContainer = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Mock container stop
      console.log(`Stopping container ${id}`)
      await refreshContainers()
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const removeContainer = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Mock container removal
      console.log(`Removing container ${id}`)
      await refreshContainers()
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const removeImage = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Mock image removal
      console.log(`Removing image ${id}`)
      await refreshImages()
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  useEffect(() => {
    // Initialize data on mount
    refreshContainers()
    refreshImages()
    refreshVolumes()
    refreshNetworks()
  }, [])

  const contextValue: DockerContextType = {
    ...state,
    refreshContainers,
    refreshImages,
    refreshVolumes,
    refreshNetworks,
    startContainer,
    stopContainer,
    removeContainer,
    removeImage,
  }

  return <DockerContext.Provider value={contextValue}>{children}</DockerContext.Provider>
}
