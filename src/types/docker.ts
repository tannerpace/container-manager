/**
 * Enhanced Docker types for Container Details View
 */

// Base types from existing DockerContext
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

// Extended types for detailed container inspection
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
    PortBindings: Record<string, Array<{
      HostIp: string
      HostPort: string
    }>>
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
    Dns: string[] | null
    DnsOptions: string[] | null
    DnsSearch: string[] | null
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
    BlkioWeightDevice: unknown[] | null
    BlkioDeviceReadBps: unknown[] | null
    BlkioDeviceWriteBps: unknown[] | null
    BlkioDeviceReadIOps: unknown[] | null
    BlkioDeviceWriteIOps: unknown[] | null
    CpuPeriod: number
    CpuQuota: number
    CpuRealtimePeriod: number
    CpuRealtimeRuntime: number
    CpusetCpus: string
    CpusetMems: string
    Devices: unknown[] | null
    DeviceCgroupRules: unknown[] | null
    DeviceRequests: unknown[] | null
    KernelMemory: number
    KernelMemoryTCP: number
    MemoryReservation: number
    MemorySwap: number
    MemorySwappiness: number | null
    OomKillDisable: boolean
    PidsLimit: number | null
    Ulimits: unknown[] | null
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
    ExposedPorts: Record<string, unknown> | null
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
    Volumes: Record<string, unknown> | null
    WorkingDir: string
    Entrypoint: string[] | null
    NetworkDisabled: boolean
    MacAddress: string
    OnBuild: string[] | null
    Labels: Record<string, string>
    StopSignal: string
    StopTimeout: number
    Shell: string[] | null
  }
  NetworkSettings: {
    Bridge: string
    SandboxID: string
    HairpinMode: boolean
    LinkLocalIPv6Address: string
    LinkLocalIPv6PrefixLen: number
    Ports: Record<string, Array<{
      HostIp: string
      HostPort: string
    }> | null>
    SandboxKey: string
    SecondaryIPAddresses: unknown[] | null
    SecondaryIPv6Addresses: unknown[] | null
    EndpointID: string
    Gateway: string
    GlobalIPv6Address: string
    GlobalIPv6PrefixLen: number
    IPAddress: string
    IPPrefixLen: number
    IPv6Gateway: string
    MacAddress: string
    Networks: Record<string, {
      IPAMConfig: unknown | null
      Links: unknown[] | null
      Aliases: unknown[] | null
      NetworkID: string
      EndpointID: string
      Gateway: string
      IPAddress: string
      IPPrefixLen: number
      IPv6Gateway: string
      GlobalIPv6Address: string
      GlobalIPv6PrefixLen: number
      MacAddress: string
      DriverOpts: unknown | null
    }>
  }
}

// Container statistics
export interface ContainerStats {
  read: string
  preread: string
  pids_stats: {
    current: number
  }
  blkio_stats: {
    io_service_bytes_recursive: Array<{
      major: number
      minor: number
      op: string
      value: number
    }>
    io_serviced_recursive: Array<{
      major: number
      minor: number
      op: string
      value: number
    }>
    io_queue_recursive: unknown[]
    io_service_time_recursive: unknown[]
    io_wait_time_recursive: unknown[]
    io_merged_recursive: unknown[]
    io_time_recursive: unknown[]
    sectors_recursive: unknown[]
  }
  num_procs: number
  storage_stats: Record<string, unknown>
  cpu_stats: {
    cpu_usage: {
      total_usage: number
      percpu_usage: number[]
      usage_in_kernelmode: number
      usage_in_usermode: number
    }
    system_cpu_usage: number
    online_cpus: number
    throttling_data: {
      periods: number
      throttled_periods: number
      throttled_time: number
    }
  }
  precpu_stats: {
    cpu_usage: {
      total_usage: number
      percpu_usage: number[]
      usage_in_kernelmode: number
      usage_in_usermode: number
    }
    system_cpu_usage: number
    online_cpus: number
    throttling_data: {
      periods: number
      throttled_periods: number
      throttled_time: number
    }
  }
  memory_stats: {
    usage: number
    max_usage: number
    stats: {
      active_anon: number
      active_file: number
      cache: number
      dirty: number
      hierarchical_memory_limit: number
      hierarchical_memsw_limit: number
      inactive_anon: number
      inactive_file: number
      mapped_file: number
      pgfault: number
      pgmajfault: number
      pgpgin: number
      pgpgout: number
      rss: number
      rss_huge: number
      total_active_anon: number
      total_active_file: number
      total_cache: number
      total_dirty: number
      total_inactive_anon: number
      total_inactive_file: number
      total_mapped_file: number
      total_pgfault: number
      total_pgmajfault: number
      total_pgpgin: number
      total_pgpgout: number
      total_rss: number
      total_rss_huge: number
      total_unevictable: number
      total_writeback: number
      unevictable: number
      writeback: number
    }
    limit: number
  }
  name: string
  id: string
  networks: Record<string, {
    rx_bytes: number
    rx_packets: number
    rx_errors: number
    rx_dropped: number
    tx_bytes: number
    tx_packets: number
    tx_errors: number
    tx_dropped: number
  }>
}

// Log entry structure
export interface LogEntry {
  timestamp: Date
  stream: 'stdout' | 'stderr'
  message: string
}

// Environment variable
export interface EnvironmentVariable {
  key: string
  value: string
  isSecret?: boolean
}

// Port mapping
export interface PortMapping {
  privatePort: number
  publicPort?: number
  ip?: string
  type: string
}

// Mount/Volume info
export interface MountInfo {
  type: string
  name?: string
  source: string
  destination: string
  driver?: string
  mode: string
  rw: boolean
  propagation: string
}

// Network info
export interface NetworkInfo {
  name: string
  networkId: string
  endpointId: string
  gateway: string
  ipAddress: string
  ipPrefixLen: number
  macAddress: string
}

// Log options for streaming
export interface LogOptions {
  follow?: boolean
  stdout?: boolean
  stderr?: boolean
  since?: number
  until?: number
  timestamps?: boolean
  tail?: number | 'all'
}

// Exec result
export interface ExecResult {
  id: string
  exitCode: number
  output: string
}

// Terminal session
export interface Terminal {
  id: string
  name: string
  shell: string
  created: Date
  active: boolean
}
