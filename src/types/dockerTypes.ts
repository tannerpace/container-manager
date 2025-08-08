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
  systemInfo: DockerSystemInfo | null
  systemUsage: SystemResourceUsage | null
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
  | { type: "SET_SYSTEM_INFO"; payload: DockerSystemInfo | null }
  | { type: "SET_SYSTEM_USAGE"; payload: SystemResourceUsage | null }

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
  createContainer: (imageId: string, containerName?: string) => Promise<void>
  createContainerWithConfig: (config: {
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
  }) => Promise<{ Id: string; Warnings?: string[] }>
  runContainer: (imageId: string, containerName?: string) => Promise<void>
  copyContainer: (containerId: string, newContainerName?: string) => Promise<void>
  openTerminal: (containerId: string) => Promise<void>
  setSearchTerm: (term: string) => void
  refreshSystemUsage: () => Promise<void>
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

// Detailed container information from docker inspect
export interface DockerContainerDetails {
  Id: string
  Created: string
  Path: string
  Args: string[]
  State: {
    Status: string
    Running: boolean
    Paused: boolean
    Restarting: boolean
    OOMKilled: boolean
    Dead: boolean
    Pid: number
    ExitCode: number
    Error: string
    StartedAt: string
    FinishedAt: string
  }
  Image: string
  ResolvConfPath: string
  HostnamePath: string
  HostsPath: string
  LogPath: string
  Name: string
  RestartCount: number
  Driver: string
  Platform: string
  MountLabel: string
  ProcessLabel: string
  AppArmorProfile: string
  ExecIDs: string[] | null
  HostConfig: {
    Binds: string[] | null
    ContainerIDFile: string
    LogConfig: {
      Type: string
      Config: Record<string, string>
    }
    NetworkMode: string
    PortBindings: Record<string, Array<{ HostIp: string; HostPort: string }>>
    RestartPolicy: {
      Name: string
      MaximumRetryCount: number
    }
    AutoRemove: boolean
    VolumeDriver: string
    VolumesFrom: string[] | null
    CapAdd: string[] | null
    CapDrop: string[] | null
    CgroupnsMode: string
    Dns: string[]
    DnsOptions: string[]
    DnsSearch: string[]
    ExtraHosts: string[] | null
    GroupAdd: string[] | null
    IpcMode: string
    Cgroup: string
    Links: string[] | null
    OomScoreAdj: number
    PidMode: string
    Privileged: boolean
    PublishAllPorts: boolean
    ReadonlyRootfs: boolean
    SecurityOpt: string[] | null
    UTSMode: string
    UsernsMode: string
    ShmSize: number
    Runtime: string
    ConsoleSize: [number, number]
    Isolation: string
    CpuShares: number
    Memory: number
    NanoCpus: number
    CgroupParent: string
    BlkioWeight: number
    BlkioWeightDevice: Array<{
      Path: string
      Weight: number
    }>
    BlkioDeviceReadBps: Array<{
      Path: string
      Rate: number
    }>
    BlkioDeviceWriteBps: Array<{
      Path: string
      Rate: number
    }>
    BlkioDeviceReadIOps: Array<{
      Path: string
      Rate: number
    }>
    BlkioDeviceWriteIOps: Array<{
      Path: string
      Rate: number
    }>
    CpuPeriod: number
    CpuQuota: number
    CpuRealtimePeriod: number
    CpuRealtimeRuntime: number
    CpusetCpus: string
    CpusetMems: string
    Devices: Array<{
      PathOnHost: string
      PathInContainer: string
      CgroupPermissions: string
    }>
    DeviceCgroupRules: string[]
    DeviceRequests: Array<{
      Driver: string
      Count: number
      DeviceIDs: string[]
      Capabilities: string[][]
      Options: Record<string, string>
    }>
    KernelMemory: number
    KernelMemoryTCP: number
    MemoryReservation: number
    MemorySwap: number
    MemorySwappiness: number | null
    OomKillDisable: boolean
    PidsLimit: number | null
    Ulimits: Array<{
      Name: string
      Hard: number
      Soft: number
    }>
    CpuCount: number
    CpuPercent: number
    IOMaximumIOps: number
    IOMaximumBandwidth: number
    MaskedPaths: string[]
    ReadonlyPaths: string[]
  }
  GraphDriver: {
    Data: Record<string, string>
    Name: string
  }
  Mounts: Array<{
    Type: string
    Name?: string
    Source: string
    Destination: string
    Driver?: string
    Mode: string
    RW: boolean
    Propagation: string
  }>
  Config: {
    Hostname: string
    Domainname: string
    User: string
    AttachStdin: boolean
    AttachStdout: boolean
    AttachStderr: boolean
    ExposedPorts: Record<string, object>
    Tty: boolean
    OpenStdin: boolean
    StdinOnce: boolean
    Env: string[]
    Cmd: string[]
    Healthcheck?: {
      Test: string[]
      Interval: number
      Timeout: number
      Retries: number
      StartPeriod: number
    }
    ArgsEscaped: boolean
    Image: string
    Volumes: Record<string, object>
    WorkingDir: string
    Entrypoint: string[] | null
    NetworkDisabled: boolean
    MacAddress: string
    OnBuild: string[] | null
    Labels: Record<string, string>
    StopSignal: string
    StopTimeout: number
    Shell: string[]
  }
  NetworkSettings: {
    Bridge: string
    SandboxID: string
    HairpinMode: boolean
    LinkLocalIPv6Address: string
    LinkLocalIPv6PrefixLen: number
    Ports: Record<string, Array<{ HostIp: string; HostPort: string }>>
    SandboxKey: string
    SecondaryIPAddresses: Array<{
      Addr: string
      PrefixLen: number
    }>
    SecondaryIPv6Addresses: Array<{
      Addr: string
      PrefixLen: number
    }>
    EndpointID: string
    Gateway: string
    GlobalIPv6Address: string
    GlobalIPv6PrefixLen: number
    IPAddress: string
    IPPrefixLen: number
    IPv6Gateway: string
    MacAddress: string
    Networks: Record<string, {
      IPAMConfig: {
        IPv4Address: string
        IPv6Address: string
        LinkLocalIPs: string[]
      }
      Links: string[] | null
      Aliases: string[] | null
      NetworkID: string
      EndpointID: string
      Gateway: string
      IPAddress: string
      IPPrefixLen: number
      IPv6Gateway: string
      GlobalIPv6Address: string
      GlobalIPv6PrefixLen: number
      MacAddress: string
      DriverOpts: Record<string, string>
    }>
  }
}

// Docker system information
export interface DockerSystemInfo {
  ID: string
  Containers: number
  ContainersRunning: number
  ContainersPaused: number
  ContainersStopped: number
  Images: number
  Driver: string
  DriverStatus: Array<[string, string]>
  SystemStatus: null | Array<[string, string]>
  Plugins: {
    Volume: string[]
    Network: string[]
    Authorization: string[]
    Log: string[]
  }
  MemoryLimit: boolean
  SwapLimit: boolean
  KernelMemory: boolean
  KernelMemoryTCP: boolean
  CpuCfsPeriod: boolean
  CpuCfsQuota: boolean
  CPUShares: boolean
  CPUSet: boolean
  PidsLimit: boolean
  IPv4Forwarding: boolean
  BridgeNfIptables: boolean
  BridgeNfIp6tables: boolean
  Debug: boolean
  NFd: number
  OomKillDisable: boolean
  NGoroutines: number
  SystemTime: string
  LoggingDriver: string
  CgroupDriver: string
  CgroupVersion: string
  NEventsListener: number
  KernelVersion: string
  OperatingSystem: string
  OSVersion: string
  OSType: string
  Architecture: string
  IndexServerAddress: string
  RegistryConfig: {
    AllowNondistributableArtifactsCIDRs: string[]
    AllowNondistributableArtifactsHostnames: string[]
    InsecureRegistryCIDRs: string[]
    IndexConfigs: Record<string, unknown>
    Mirrors: string[]
  }
  NCPU: number
  MemTotal: number
  GenericResources: null | unknown[]
  DockerRootDir: string
  HttpProxy: string
  HttpsProxy: string
  NoProxy: string
  Name: string
  Labels: string[]
  ExperimentalBuild: boolean
  ServerVersion: string
  Runtimes: Record<string, {
    path: string
    runtimeArgs?: string[]
  }>
  DefaultRuntime: string
  Swarm: {
    NodeID: string
    NodeAddr: string
    LocalNodeState: string
    ControlAvailable: boolean
    Error: string
    RemoteManagers: Array<{
      NodeID: string
      Addr: string
    }>
  }
  LiveRestoreEnabled: boolean
  Isolation: string
  InitBinary: string
  ContainerdCommit: {
    ID: string
    Expected: string
  }
  RuncCommit: {
    ID: string
    Expected: string
  }
  InitCommit: {
    ID: string
    Expected: string
  }
  SecurityOptions: string[]
  ProductLicense: string
  DefaultAddressPools: Array<{
    Base: string
    Size: number
  }>
  Warnings: string[]
}

// System resource usage
export interface SystemResourceUsage {
  cpuPercent: number
  memoryUsed: number
  memoryTotal: number
  memoryPercent: number
  lastUpdated: Date
}
