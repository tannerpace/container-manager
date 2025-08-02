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

export interface DockerState {
  containers: DockerContainer[]
  images: DockerImage[]
  volumes: DockerVolume[]
  networks: DockerNetwork[]
  loading: boolean
  error: string | null
  connected: boolean
  searchTerm: string
}

export type DockerAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_CONTAINERS"; payload: DockerContainer[] }
  | { type: "SET_IMAGES"; payload: DockerImage[] }
  | { type: "SET_VOLUMES"; payload: DockerVolume[] }
  | { type: "SET_NETWORKS"; payload: DockerNetwork[] }
  | { type: "SET_SEARCH_TERM"; payload: string }

export interface DockerContextType extends DockerState {
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
