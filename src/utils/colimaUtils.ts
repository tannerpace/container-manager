/**
 * Colima management utilities for macOS users
 */

export interface ColimaStatus {
  status: 'Running' | 'Stopped' | 'Unknown'
  runtime: string
  cpu: number
  memory: string
  disk: string
  address?: string
}

export interface ColimaStartOptions {
  cpu?: number
  memory?: number
  api?: boolean
  runtime?: 'docker' | 'containerd'
}

/**
 * Check if Colima is available on the system
 */
export const isColimaAvailable = async (): Promise<boolean> => {
  try {
    // In Electron, this would use child_process
    if (typeof window !== 'undefined' && window.electron) {
      const result = await window.electron.exec('which colima')
      return result.stdout.trim().length > 0
    }
    return false
  } catch {
    return false
  }
}

/**
 * Get current Colima status
 */
export const getColimaStatus = async (): Promise<ColimaStatus> => {
  try {
    if (typeof window !== 'undefined' && window.electron) {
      const result = await window.electron.exec('colima status --format json')
      return JSON.parse(result.stdout)
    }
    throw new Error('Electron not available')
  } catch (error) {
    return {
      status: 'Unknown',
      runtime: 'docker',
      cpu: 0,
      memory: '0GB',
      disk: '0GB'
    }
  }
}

/**
 * Start Colima with specified options
 */
export const startColima = async (options: ColimaStartOptions = {}): Promise<string> => {
  const {
    cpu = 2,
    memory = 4,
    api = true,
    runtime = 'docker'
  } = options

  const args = [
    'start',
    `--cpu ${cpu}`,
    `--memory ${memory}`,
    `--runtime ${runtime}`,
    ...(api ? ['--api'] : [])
  ]

  try {
    if (typeof window !== 'undefined' && window.electron) {
      const result = await window.electron.execLongRunning(`colima ${args.join(' ')}`)
      return result.stdout
    }
    throw new Error('Electron not available')
  } catch (error) {
    throw new Error(`Failed to start Colima: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Stop Colima
 */
export const stopColima = async (): Promise<string> => {
  try {
    if (typeof window !== 'undefined' && window.electron) {
      const result = await window.electron.exec('colima stop')
      return result.stdout
    }
    throw new Error('Electron not available')
  } catch (error) {
    throw new Error(`Failed to stop Colima: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check if Docker API is accessible
 */
export const checkDockerAPI = async (host = 'localhost:2375'): Promise<boolean> => {
  try {
    const response = await fetch(`http://${host}/version`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get optimal Colima configuration for the current system
 */
export const getOptimalColimaConfig = (): ColimaStartOptions => {
  // Basic detection - in a real app, you might check system resources
  const isAppleSilicon = typeof navigator !== 'undefined' &&
    (navigator.userAgent.includes('Mac') && navigator.hardwareConcurrency >= 8)

  return {
    cpu: isAppleSilicon ? 4 : 2,
    memory: isAppleSilicon ? 8 : 4,
    api: true,
    runtime: 'docker'
  }
}

// Type declaration for Electron bridge
declare global {
  interface Window {
    electron?: {
      exec: (command: string) => Promise<{ stdout: string; stderr: string }>
      execLongRunning: (command: string) => Promise<{ stdout: string; stderr: string }>
    }
  }
}
