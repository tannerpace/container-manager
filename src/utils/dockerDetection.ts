/**
 * Docker Connection Detection Utility
 * 
 * This utility helps automatically detect and configure Docker connections
 * for different environments (Colima, Docker Desktop, OrbStack, etc.)
 */

import type { DockerConfig } from '../config/docker'

export interface DockerConnectionInfo {
  type: 'colima-tcp' | 'colima-socket' | 'docker-desktop' | 'orbstack' | 'unknown'
  config: DockerConfig
  available: boolean
  error?: string
}

/**
 * Test if a TCP endpoint is accessible
 */
export async function testTCPConnection(url: string, timeout = 5000): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(`${url}/version`, {
      method: 'GET',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

/**
 * Check if running in Electron environment
 */
export function isElectronApp(): boolean {
  return typeof window !== 'undefined' &&
    typeof window.require === 'function'
}

/**
 * Get current user's home directory path
 */
export function getUserHome(): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.HOME || process.env.USERPROFILE || '/Users/user'
  }
  return '/Users/user' // fallback
}

/**
 * Detect available Docker connections
 */
export async function detectDockerConnections(): Promise<DockerConnectionInfo[]> {
  const connections: DockerConnectionInfo[] = []

  // Test Colima TCP (port 2375)
  const colimaTCPAvailable = await testTCPConnection('http://localhost:2375')
  connections.push({
    type: 'colima-tcp',
    config: {
      apiUrl: 'http://localhost:2375',
      timeout: 10000,
      retryAttempts: 3,
    },
    available: colimaTCPAvailable,
  })

  // Test Docker Desktop / OrbStack (also port 2375)
  if (colimaTCPAvailable) {
    connections.push({
      type: 'docker-desktop',
      config: {
        apiUrl: 'http://localhost:2375',
        timeout: 10000,
        retryAttempts: 3,
      },
      available: true,
    })
  }

  // For Electron apps, add Unix socket option
  if (isElectronApp()) {
    const socketPath = `${getUserHome()}/.colima/default/docker.sock`
    connections.push({
      type: 'colima-socket',
      config: {
        apiUrl: `unix://${socketPath}`,
        timeout: 10000,
        retryAttempts: 3,
      },
      available: true, // We can't easily test Unix sockets from renderer process
    })
  }

  return connections
}

/**
 * Get the best available Docker connection
 */
export async function getBestDockerConnection(): Promise<DockerConnectionInfo> {
  const connections = await detectDockerConnections()

  // Prefer TCP connections for simplicity
  const tcpConnection = connections.find(c => c.type === 'colima-tcp' && c.available)
  if (tcpConnection) {
    return tcpConnection
  }

  // Fallback to socket for Electron
  const socketConnection = connections.find(c => c.type === 'colima-socket')
  if (socketConnection) {
    return socketConnection
  }

  // Return first available or unknown
  return connections.find(c => c.available) || {
    type: 'unknown',
    config: {
      apiUrl: 'http://localhost:2375',
      timeout: 10000,
      retryAttempts: 3,
    },
    available: false,
    error: 'No Docker daemon found. Please start Colima, Docker Desktop, or OrbStack.',
  }
}

/**
 * Generate setup instructions based on detected environment
 */
export function getSetupInstructions(connectionInfo: DockerConnectionInfo): string[] {
  switch (connectionInfo.type) {
    case 'colima-tcp':
      return [
        'Colima detected! To enable API access:',
        '1. colima stop',
        '2. colima start --api --cpu 2 --memory 4',
        '3. Verify: curl http://localhost:2375/version',
      ]

    case 'colima-socket':
      return [
        'Colima Unix socket detected. For Electron apps:',
        '1. Start Colima: colima start',
        '2. Socket available at: ~/.colima/default/docker.sock',
        '3. Configure app to use Unix socket directly',
      ]

    case 'docker-desktop':
      return [
        'Docker Desktop detected. To enable API:',
        '1. Open Docker Desktop Settings',
        '2. Go to General tab',
        '3. Enable "Expose daemon on tcp://localhost:2375 without TLS"',
        '4. Apply & Restart',
      ]

    default:
      return [
        'No Docker daemon detected. Install one of:',
        '• Colima: brew install colima && colima start --api',
        '• OrbStack: brew install orbstack && orb start',
        '• Docker Desktop: Enable API in settings',
      ]
  }
}
