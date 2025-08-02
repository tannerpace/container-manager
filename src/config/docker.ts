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

  // Docker Desktop with TLS
  desktopTLS: {
    apiUrl: 'https://localhost:2376',
    timeout: 10000,
    retryAttempts: 3,
  },

  // Unix socket (requires proxy server for browser access)
  unix: {
    apiUrl: 'http://localhost:8080', // Proxy server URL
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
  // Try to detect the environment and return appropriate config

  // For development, we'll start with Docker Desktop without TLS
  return DOCKER_CONFIGS.desktop
}

/**
 * Instructions for enabling Docker API access:
 * 
 * 1. Docker Desktop:
 *    - Go to Settings > General
 *    - Enable "Expose daemon on tcp://localhost:2375 without TLS"
 *    - Restart Docker Desktop
 * 
 * 2. Docker on Linux:
 *    - Edit /etc/docker/daemon.json:
 *      {
 *        "hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2375"]
 *      }
 *    - Restart Docker: sudo systemctl restart docker
 * 
 * 3. For production environments:
 *    - Use TLS authentication
 *    - Restrict access to specific IPs
 *    - Consider using a proxy server
 * 
 * 4. CORS Issues:
 *    - The Docker API doesn't set CORS headers
 *    - You may need to use a proxy server or browser extension
 *    - For development, you can disable CORS in Chrome:
 *      chrome --disable-web-security --user-data-dir=/tmp/chrome_dev
 */
