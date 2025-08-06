/**
 * Embedded Docker Socket Bridge
 * 
 * This creates a TCP-to-Unix-socket bridge that runs inside your Electron app
 * No external dependencies - perfect for standalone deployment
 */

import * as net from 'net'
import * as path from 'path'

export class DockerSocketBridge {
  private server: net.Server | null = null
  private socketPath: string
  private tcpPort: number = 2375
  private isRunning: boolean = false

  constructor(socketPath?: string, tcpPort?: number) {
    this.socketPath = socketPath || path.join(
      process.env.HOME || '/Users/user',
      '.colima/default/docker.sock'
    )
    this.tcpPort = tcpPort || 2375
  }

  /**
   * Start the bridge server
   */
  async start(): Promise<boolean> {
    if (this.isRunning) {
      return true
    }

    return new Promise((resolve) => {
      this.server = net.createServer((clientSocket) => {
        // Connect to Unix socket when client connects
        const dockerSocket = net.connect(this.socketPath)

        // Pipe data between client and Docker socket
        clientSocket.pipe(dockerSocket)
        dockerSocket.pipe(clientSocket)

        // Handle errors
        clientSocket.on('error', (err) => {
          console.warn('Client socket error:', err.message)
          dockerSocket.destroy()
        })

        dockerSocket.on('error', (err) => {
          console.warn('Docker socket error:', err.message)
          clientSocket.destroy()
        })

        // Clean up on close
        clientSocket.on('close', () => {
          dockerSocket.destroy()
        })

        dockerSocket.on('close', () => {
          clientSocket.destroy()
        })
      })

      this.server.listen(this.tcpPort, 'localhost', () => {
        console.log(`Docker bridge running on localhost:${this.tcpPort}`)
        console.log(`Bridging to: ${this.socketPath}`)
        this.isRunning = true
        resolve(true)
      })

      this.server.on('error', (err) => {
        console.error('Bridge server error:', err.message)
        this.isRunning = false
        resolve(false)
      })
    })
  }

  /**
   * Stop the bridge server
   */
  async stop(): Promise<void> {
    if (this.server && this.isRunning) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          console.log('Docker bridge stopped')
          this.isRunning = false
          resolve()
        })
      })
    }
  }

  /**
   * Check if bridge is running
   */
  isActive(): boolean {
    return this.isRunning
  }

  /**
   * Get the TCP endpoint URL
   */
  getEndpoint(): string {
    return `http://localhost:${this.tcpPort}`
  }
}

/**
 * Auto-start bridge when Electron app starts
 */
export async function initializeDockerBridge(): Promise<DockerSocketBridge> {
  const bridge = new DockerSocketBridge()

  try {
    const started = await bridge.start()
    if (started) {
      console.log('✅ Docker bridge initialized successfully')
      return bridge
    } else {
      console.warn('⚠️ Docker bridge failed to start')
      return bridge
    }
  } catch (error) {
    console.error('❌ Docker bridge initialization failed:', error)
    return bridge
  }
}
