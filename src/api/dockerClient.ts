import { getCurrentDockerConfig } from '../config/docker'
import type {
  ContainerStats,
  DockerContainer,
  DockerContainerDetails,
  LogEntry,
  LogOptions
} from '../types/docker'

/**
 * Enhanced Docker API Client for Container Details functionality
 */
export class DockerAPIClient {
  private baseURL: string
  private timeout: number = 10000

  constructor() {
    const dockerConfig = getCurrentDockerConfig()
    this.baseURL = dockerConfig.apiUrl
  }

  /**
   * Make a request to the Docker API
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Docker API error: ${response.status} ${response.statusText}`)
      }

      // Handle empty responses
      const text = await response.text()
      if (!text || text.trim() === '') {
        // Return appropriate empty response based on content type
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          return [] as T // Return empty array for JSON responses
        }
        return '' as T // Return empty string for text responses
      }

      // Handle different response types
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        try {
          return JSON.parse(text)
        } catch (parseError) {
          console.error('Failed to parse JSON response:', text, parseError)
          throw new Error('Invalid JSON response from Docker API')
        }
      } else {
        return text as T
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out')
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Unable to connect to Docker daemon. Make sure Docker is running and API is accessible.')
        }
      }
      throw error
    }
  }

  // Container operations
  async getContainers(all = true): Promise<DockerContainer[]> {
    return this.makeRequest<DockerContainer[]>(`/containers/json?all=${all}`)
  }

  async getContainer(id: string): Promise<DockerContainerDetails> {
    return this.makeRequest<DockerContainerDetails>(`/containers/${id}/json`)
  }

  async startContainer(id: string): Promise<void> {
    await this.makeRequest(`/containers/${id}/start`, { method: 'POST' })
  }

  async stopContainer(id: string, timeout = 10): Promise<void> {
    await this.makeRequest(`/containers/${id}/stop?t=${timeout}`, { method: 'POST' })
  }

  async restartContainer(id: string, timeout = 10): Promise<void> {
    await this.makeRequest(`/containers/${id}/restart?t=${timeout}`, { method: 'POST' })
  }

  async pauseContainer(id: string): Promise<void> {
    await this.makeRequest(`/containers/${id}/pause`, { method: 'POST' })
  }

  async unpauseContainer(id: string): Promise<void> {
    await this.makeRequest(`/containers/${id}/unpause`, { method: 'POST' })
  }

  async removeContainer(id: string, force = false, removeVolumes = false): Promise<void> {
    const params = new URLSearchParams()
    if (force) params.append('force', 'true')
    if (removeVolumes) params.append('v', 'true')

    const query = params.toString() ? `?${params.toString()}` : ''
    await this.makeRequest(`/containers/${id}${query}`, { method: 'DELETE' })
  }

  async renameContainer(id: string, name: string): Promise<void> {
    await this.makeRequest(`/containers/${id}/rename?name=${encodeURIComponent(name)}`, {
      method: 'POST'
    })
  }

  async exportContainer(id: string, repo: string = '', tag: string = 'latest'): Promise<{ Id: string }> {
    const params = new URLSearchParams()
    params.append('container', id)
    if (repo) {
      params.append('repo', repo)
      if (tag) {
        params.append('tag', tag)
      }
    }

    const query = params.toString() ? `?${params.toString()}` : ''
    return this.makeRequest<{ Id: string }>(`/commit${query}`, { method: 'POST' })
  }

  // Container inspection and monitoring
  async getContainerLogs(id: string, options: LogOptions = {}): Promise<string> {
    const params = new URLSearchParams()
    if (options.follow) params.append('follow', 'true')
    if (options.stdout !== false) params.append('stdout', 'true')
    if (options.stderr !== false) params.append('stderr', 'true')
    if (options.since) params.append('since', options.since.toString())
    if (options.until) params.append('until', options.until.toString())
    if (options.timestamps) params.append('timestamps', 'true')
    if (options.tail) params.append('tail', options.tail.toString())

    const query = params.toString() ? `?${params.toString()}` : ''
    return this.makeRequest<string>(`/containers/${id}/logs${query}`)
  }

  async getContainerStats(id: string, stream = false): Promise<ContainerStats> {
    const query = stream ? '?stream=true' : '?stream=false'
    return this.makeRequest<ContainerStats>(`/containers/${id}/stats${query}`)
  }

  // Container execution
  async createExec(id: string, options: {
    AttachStdin?: boolean
    AttachStdout?: boolean
    AttachStderr?: boolean
    DetachKeys?: string
    Tty?: boolean
    Env?: string[]
    Cmd: string[]
    Privileged?: boolean
    User?: string
    WorkingDir?: string
  }): Promise<{ Id: string }> {
    return this.makeRequest<{ Id: string }>(`/containers/${id}/exec`, {
      method: 'POST',
      body: JSON.stringify({
        AttachStdin: options.AttachStdin ?? false,
        AttachStdout: options.AttachStdout ?? true,
        AttachStderr: options.AttachStderr ?? true,
        DetachKeys: options.DetachKeys ?? 'ctrl-p,ctrl-q',
        Tty: options.Tty ?? false,
        Env: options.Env ?? [],
        Cmd: options.Cmd,
        Privileged: options.Privileged ?? false,
        User: options.User ?? '',
        WorkingDir: options.WorkingDir ?? '',
      }),
    })
  }

  async startExec(execId: string, options: {
    Detach?: boolean
    Tty?: boolean
  } = {}): Promise<void> {
    await this.makeRequest(`/exec/${execId}/start`, {
      method: 'POST',
      body: JSON.stringify({
        Detach: options.Detach ?? false,
        Tty: options.Tty ?? false,
      }),
    })
  }

  async inspectExec(execId: string): Promise<{
    CanRemove: boolean
    DetachKeys: string
    ID: string
    Running: boolean
    ExitCode: number | null
    ProcessConfig: {
      privileged: boolean
      user: string
      tty: boolean
      entrypoint: string
      arguments: string[]
    }
    OpenStdin: boolean
    OpenStderr: boolean
    OpenStdout: boolean
    ContainerID: string
    Pid: number
  }> {
    return this.makeRequest(`/exec/${execId}/json`)
  }

  async resizeExec(execId: string, cols: number, rows: number): Promise<void> {
    await this.makeRequest(`/exec/${execId}/resize?h=${rows}&w=${cols}`, {
      method: 'POST'
    })
  }

  // Streaming methods
  async streamLogs(
    id: string,
    options: LogOptions & { onData: (chunk: string) => void, onError?: (error: Error) => void }
  ): Promise<void> {
    const params = new URLSearchParams()
    params.append('follow', 'true')
    if (options.stdout !== false) params.append('stdout', 'true')
    if (options.stderr !== false) params.append('stderr', 'true')
    if (options.since) params.append('since', options.since.toString())
    if (options.timestamps) params.append('timestamps', 'true')
    if (options.tail) params.append('tail', options.tail.toString())

    try {
      const response = await fetch(`${this.baseURL}/containers/${id}/logs?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Docker API error: ${response.status} ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Failed to get response reader')
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        options.onData(chunk)
      }
    } catch (error) {
      if (options.onError) {
        options.onError(error instanceof Error ? error : new Error('Unknown error'))
      } else {
        throw error
      }
    }
  }

  async streamStats(
    id: string,
    onData: (stats: ContainerStats) => void,
    onError?: (error: Error) => void
  ): Promise<() => void> {
    let controller: AbortController | null = new AbortController()

    const startStream = async () => {
      try {
        const response = await fetch(`${this.baseURL}/containers/${id}/stats?stream=true`, {
          signal: controller?.signal
        })

        if (!response.ok) {
          throw new Error(`Docker API error: ${response.status} ${response.statusText}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('Failed to get response reader')
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // Split by newlines and process complete JSON objects
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim()) {
              try {
                const stats = JSON.parse(line) as ContainerStats
                onData(stats)
              } catch (parseError) {
                console.warn('Failed to parse stats JSON:', parseError)
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          if (onError) {
            onError(error)
          } else {
            throw error
          }
        }
      }
    }

    startStream()

    // Return cleanup function
    return () => {
      if (controller) {
        controller.abort()
        controller = null
      }
    }
  }

  // Utility methods
  parseLogEntry(rawLogLine: string): LogEntry {
    // Docker log format includes 8-byte header for multiplexed streams
    // For now, we'll implement a basic parser
    const timestampMatch = rawLogLine.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s+(.*)$/)

    if (timestampMatch) {
      return {
        timestamp: new Date(timestampMatch[1]),
        stream: 'stdout', // We'll need to enhance this based on the header
        message: timestampMatch[2]
      }
    }

    return {
      timestamp: new Date(),
      stream: 'stdout',
      message: rawLogLine
    }
  }

  // Calculate CPU percentage from stats
  calculateCPUPercent(stats: ContainerStats): number {
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage
    const onlineCPUs = stats.cpu_stats.online_cpus

    if (systemDelta > 0 && cpuDelta > 0) {
      return (cpuDelta / systemDelta) * onlineCPUs * 100
    }

    return 0
  }

  // Calculate memory usage percentage
  calculateMemoryPercent(stats: ContainerStats): number {
    if (stats.memory_stats.limit > 0) {
      return (stats.memory_stats.usage / stats.memory_stats.limit) * 100
    }
    return 0
  }

  // Format bytes to human readable
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }
}

// Create singleton instance
export const dockerAPI = new DockerAPIClient()
