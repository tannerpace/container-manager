/**
 * import { app, ipcMain } from 'electron'
import * as fs from 'fs'
import * as http from 'http'
import * as path from 'path'
import type { DockerContainer, DockerContainerDetails } from '../types/docker'ron-Native Docker Client
 * 
 * This client can access Docker Unix sockets directly via Node.js APIs
 * No external dependencies like socat required - perfect for standalone deployment
 */

import { app, ipcMain } from 'electron'
import * as fs from 'fs'
import * as http from 'http'
import * as path from 'path'
import type { DockerContainer, DockerContainerDetails } from '../types/docker'

interface RequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: unknown
}

export class ElectronDockerClient {
  private socketPath: string
  private isElectronApp: boolean

  constructor() {
    this.isElectronApp = typeof app !== 'undefined'
    this.socketPath = this.detectSocketPath()
  }

  /**
   * Detect Docker socket path for different environments
   */
  private detectSocketPath(): string {
    const possiblePaths = [
      // Colima
      path.join(process.env.HOME || '/Users/user', '.colima/default/docker.sock'),
      // Docker Desktop on macOS
      '/var/run/docker.sock',
      // Docker Desktop in container
      '/var/run/docker.sock.raw',
    ]

    for (const socketPath of possiblePaths) {
      try {
        if (fs.existsSync(socketPath)) {
          return socketPath
        }
      } catch {
        // Continue to next path
      }
    }

    // Fallback to Colima path
    return possiblePaths[0]
  }

  /**
   * Make HTTP request over Unix socket (Electron main process only)
   */
  async makeSocketRequest(endpoint: string, options: RequestOptions = {}): Promise<unknown> {
    if (!this.isElectronApp) {
      throw new Error('Unix socket access only available in Electron main process')
    }

    return new Promise((resolve, reject) => {
      const requestOptions = {
        socketPath: this.socketPath,
        path: endpoint,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      }

      const req = http.request(requestOptions, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          try {
            const result = data ? JSON.parse(data) : null
            resolve(result)
          } catch {
            resolve(data) // Return raw data if not JSON
          }
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      if (options.body) {
        req.write(JSON.stringify(options.body))
      }

      req.end()
    })
  }

  /**
   * API methods that work with Unix sockets
   */
  async getContainers(): Promise<DockerContainer[]> {
    return this.makeSocketRequest('/containers/json?all=true') as Promise<DockerContainer[]>
  }

  async getContainer(id: string): Promise<DockerContainerDetails> {
    return this.makeSocketRequest(`/containers/${id}/json`) as Promise<DockerContainerDetails>
  }

  async startContainer(id: string): Promise<void> {
    await this.makeSocketRequest(`/containers/${id}/start`, { method: 'POST' })
  }

  async stopContainer(id: string): Promise<void> {
    await this.makeSocketRequest(`/containers/${id}/stop`, { method: 'POST' })
  }

  async restartContainer(id: string): Promise<void> {
    await this.makeSocketRequest(`/containers/${id}/restart`, { method: 'POST' })
  }

  async pauseContainer(id: string): Promise<void> {
    await this.makeSocketRequest(`/containers/${id}/pause`, { method: 'POST' })
  }

  async unpauseContainer(id: string): Promise<void> {
    await this.makeSocketRequest(`/containers/${id}/unpause`, { method: 'POST' })
  }

  async removeContainer(id: string): Promise<void> {
    await this.makeSocketRequest(`/containers/${id}`, { method: 'DELETE' })
  }

  // ... other Docker API methods
}

/**
 * IPC handlers for Electron main process
 */
export function setupDockerIPC(): void {
  const dockerClient = new ElectronDockerClient()

  // Register IPC handlers
  ipcMain.handle('docker:getContainers', async () => {
    return dockerClient.getContainers()
  })

  ipcMain.handle('docker:getContainer', async (_event: Electron.IpcMainInvokeEvent, id: string) => {
    return dockerClient.getContainer(id)
  })

  ipcMain.handle('docker:startContainer', async (_event: Electron.IpcMainInvokeEvent, id: string) => {
    return dockerClient.startContainer(id)
  })

  ipcMain.handle('docker:stopContainer', async (_event: Electron.IpcMainInvokeEvent, id: string) => {
    return dockerClient.stopContainer(id)
  })

  ipcMain.handle('docker:restartContainer', async (_event: Electron.IpcMainInvokeEvent, id: string) => {
    return dockerClient.restartContainer(id)
  })

  ipcMain.handle('docker:pauseContainer', async (_event: Electron.IpcMainInvokeEvent, id: string) => {
    return dockerClient.pauseContainer(id)
  })

  ipcMain.handle('docker:unpauseContainer', async (_event: Electron.IpcMainInvokeEvent, id: string) => {
    return dockerClient.unpauseContainer(id)
  })

  ipcMain.handle('docker:removeContainer', async (_event: Electron.IpcMainInvokeEvent, id: string) => {
    return dockerClient.removeContainer(id)
  })
}
