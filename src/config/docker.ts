/**
 * Docker API Configuration
 * 
 * This file contains configuration for connecting to the Docker Engine API.
 * The Docker API is typically available on different endpoints depending on your setup.
 */

export interface DockerConfig {
  apiUrl: string
  timeout: number
  retryAttempts: number
}

// Default configuration for different environments
export const DOCKER_CONFIGS = {
  // Docker Desktop on macOS/Windows (TCP with TLS disabled)
  desktop: {
    apiUrl: 'http://localhost:2375',
    timeout: 10000,
    retryAttempts: 3,
  },

  // Colima with TCP API enabled
  colimaTCP: {
    apiUrl: 'http://localhost:2375',
    timeout: 10000,
    retryAttempts: 3,
  },

  // Colima via Unix socket (for Electron apps)
  colimaSocket: {
    apiUrl: 'unix:///Users/' + (process.env.USER || 'user') + '/.colima/default/docker.sock',
    timeout: 10000,
    retryAttempts: 3,
  },

  // Docker Desktop with TLS
  desktopTLS: {
    apiUrl: 'https://localhost:2376',
    timeout: 10000,
    retryAttempts: 3,
  },

  // Unix socket via socat proxy
  socketProxy: {
    apiUrl: 'http://localhost:2375', // socat proxy URL
    timeout: 10000,
    retryAttempts: 3,
  },

  // Remote Docker host
  remote: {
    apiUrl: 'http://your-docker-host:2375',
    timeout: 15000,
    retryAttempts: 2,
  },
} as const

// Current configuration - modify this based on your Docker setup
export const getCurrentDockerConfig = (): DockerConfig => {
  // Check if we're in Electron environment
  const isElectron = typeof window !== 'undefined' &&
    typeof (window as Window & { electronAPI?: unknown }).electronAPI !== 'undefined'

  // Check if we're in Node.js environment (Electron main process)
  const isNodeJS = typeof process !== 'undefined' && process.versions?.node

  if (isElectron) {
    // In Electron renderer, use the bridge endpoint
    return DOCKER_CONFIGS.colimaTCP
  }

  if (isNodeJS) {
    // In Electron main process, we can use Unix sockets directly
    return DOCKER_CONFIGS.colimaSocket
  }

  // For browser environment, try TCP endpoints
  return DOCKER_CONFIGS.colimaTCP
}

/**
 * Instructions for enabling Docker API access:
 * 
 * 1. Colima (Recommended for macOS):
 *    Option 1: colima start --api --cpu 2 --memory 4
 *    Option 2: colima start + socat TCP-LISTEN:2375,reuseaddr,fork UNIX-CONNECT:/Users/$USER/.colima/default/docker.sock &
 *    Option 3: For Electron apps, use Unix socket directly
 * 
 * 2. Docker Desktop:
 *    - Go to Settings > General
 *    - Enable "Expose daemon on tcp://localhost:2375 without TLS"
 *    - Restart Docker Desktop
 * 
 * 3. OrbStack (Alternative):
 *    - brew install orbstack && orb start
 *    - API automatically available on localhost:2375
 * 
 * 4. For production environments:
 *    - Use TLS authentication
 *    - Restrict access to specific IPs
 *    - Consider using a proxy server
 * 
 * 5. CORS Issues (Browser only):
 *    - The Docker API doesn't set CORS headers
 *    - You may need to use a proxy server or browser extension
 *    - For development, you can disable CORS in Chrome:
 *      chrome --disable-web-security --user-data-dir=/tmp/chrome_dev
 */
