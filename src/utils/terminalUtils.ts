/**
 * Terminal utilities for opening native macOS Terminal app with Docker commands
 */

export interface TerminalOptions {
  containerId: string
  containerName?: string
  command?: string
  title?: string
}

/**
 * Opens macOS Terminal app with a Docker exec command
 */
export const openMacTerminalWithDocker = async (options: TerminalOptions): Promise<void> => {
  const { containerId, containerName, command = "/bin/sh", title } = options

  const containerDisplayName = containerName || containerId.substring(0, 12)
  const windowTitle = title || `Docker: ${containerDisplayName}`

  // Create the docker exec command
  const dockerCommand = `docker exec -it ${containerId} ${command}`

  // Create AppleScript to open Terminal with the command
  const appleScript = `
    tell application "Terminal"
      activate
      set newTab to do script "${dockerCommand}"
      set custom title of newTab to "${windowTitle}"
    end tell
  `

  try {
    // In a web browser, we can't execute AppleScript directly
    // We need to check if we're in Electron or provide instructions
    if (typeof window !== 'undefined' && window.electron) {
      // If in Electron, use the bridge to execute AppleScript
      await window.electron.executeAppleScript(appleScript)
    } else {
      // If in browser, show instructions for manual execution
      showTerminalInstructions(dockerCommand, containerDisplayName)
    }
  } catch (error) {
    console.error('Failed to open Terminal:', error)
    // Fallback to showing instructions
    showTerminalInstructions(dockerCommand, containerDisplayName)
  }
}

/**
 * Opens macOS Terminal with a general command
 */
export const openMacTerminalWithCommand = async (command: string, title?: string): Promise<void> => {
  const appleScript = `
    tell application "Terminal"
      activate
      set newTab to do script "${command}"
      ${title ? `set custom title of newTab to "${title}"` : ''}
    end tell
  `

  try {
    if (typeof window !== 'undefined' && window.electron) {
      await window.electron.executeAppleScript(appleScript)
    } else {
      showCommandInstructions(command, title)
    }
  } catch (error) {
    console.error('Failed to open Terminal:', error)
    showCommandInstructions(command, title)
  }
}

/**
 * Shows instructions when Terminal can't be opened automatically
 */
const showTerminalInstructions = (dockerCommand: string, containerName: string): void => {
  const message = `To connect to ${containerName}:

1. Open Terminal app
2. Run this command:
   ${dockerCommand}

The command has been copied to your clipboard.`

  // Copy to clipboard if available
  if (navigator.clipboard) {
    navigator.clipboard.writeText(dockerCommand).catch(() => {
      console.warn('Failed to copy to clipboard')
    })
  }

  alert(message)
}

/**
 * Shows instructions for general commands
 */
const showCommandInstructions = (command: string, title?: string): void => {
  const message = `${title ? `${title}:\n\n` : ''}Please run this command in Terminal:

${command}

The command has been copied to your clipboard.`

  // Copy to clipboard if available
  if (navigator.clipboard) {
    navigator.clipboard.writeText(command).catch(() => {
      console.warn('Failed to copy to clipboard')
    })
  }

  alert(message)
}

/**
 * Quick actions for common Docker Terminal operations
 */
export const dockerTerminalActions = {
  /**
   * Open shell in container
   */
  shell: (containerId: string, containerName?: string) =>
    openMacTerminalWithDocker({
      containerId,
      containerName,
      command: "/bin/sh",
      title: `Shell: ${containerName || containerId.substring(0, 12)}`
    }),

  /**
   * Open bash in container (if available)
   */
  bash: (containerId: string, containerName?: string) =>
    openMacTerminalWithDocker({
      containerId,
      containerName,
      command: "/bin/bash",
      title: `Bash: ${containerName || containerId.substring(0, 12)}`
    }),

  /**
   * View container logs in Terminal
   */
  logs: (containerId: string, containerName?: string) =>
    openMacTerminalWithCommand(
      `docker logs -f ${containerId}`,
      `Logs: ${containerName || containerId.substring(0, 12)}`
    ),

  /**
   * Monitor container stats
   */
  stats: (containerId: string, containerName?: string) =>
    openMacTerminalWithCommand(
      `docker stats ${containerId}`,
      `Stats: ${containerName || containerId.substring(0, 12)}`
    ),

  /**
   * Open Terminal with Colima commands
   */
  colima: () =>
    openMacTerminalWithCommand(
      'colima start --api --cpu 4 --memory 8',
      'Colima Setup'
    )
}

import '../types/electron'
