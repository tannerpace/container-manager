/**
 * Electron Main Process
 * 
 * Entry point for the Electron app
 * Sets up native Docker access and IPC handlers
 */

import { exec, spawn } from 'child_process'
import { app, BrowserWindow, ipcMain } from 'electron'
import * as os from 'os'
import * as path from 'path'
import { promisify } from 'util'
import { DockerSocketBridge } from './dockerBridge'
import { setupDockerIPC } from './dockerClient'

const execAsync = promisify(exec)

let mainWindow: Electron.BrowserWindow | null = null
let dockerBridge: DockerSocketBridge | null = null

/**
 * Create the main applicatsion window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // Use loadFile for production build - simpler and more reliable
    mainWindow.loadFile(path.join(__dirname, '../../index.html'))
    // Open dev tools in production to debug blank screen
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

/**
 * Set up Docker connectivity
 */
async function setupDocker(): Promise<void> {
  try {
    // Set up native Docker IPC handlers
    setupDockerIPC()

    // Optionally start the Docker bridge for HTTP API compatibility
    dockerBridge = new DockerSocketBridge()
    const bridgeStarted = await dockerBridge.start()

    if (bridgeStarted) {
      console.log('Docker bridge started successfully')
    } else {
      console.warn('Docker bridge failed to start - using native socket access only')
    }
  } catch (error) {
    console.error('Failed to set up Docker connectivity:', error)
  }
}

/**
 * App event handlers
 */
app.whenReady().then(async () => {
  await createWindow()
  await setupDocker()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', async () => {
  // Clean up Docker bridge
  if (dockerBridge) {
    await dockerBridge.stop()
  }

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  // Clean up Docker bridge
  if (dockerBridge) {
    await dockerBridge.stop()
  }
})

/**
 * Additional IPC handlers for app-specific functionality
 */
ipcMain.handle('app:getVersion', () => {
  return app.getVersion()
})

ipcMain.handle('app:getPlatform', () => {
  return process.platform
})

/**
 * System utility IPC handlers
 */
ipcMain.handle('system:execute-applescript', async (_event, script: string) => {
  const { stdout } = await execAsync(`osascript -e "${script.replace(/"/g, '\\"')}"`)
  return stdout.trim()
})

ipcMain.handle('system:exec', async (_event, command: string) => {
  try {
    const result = await execAsync(command)
    return {
      stdout: result.stdout,
      stderr: result.stderr
    }
  } catch (error: unknown) {
    const err = error as Error
    return {
      stdout: '',
      stderr: err.message
    }
  }
})

ipcMain.handle('system:exec-long-running', async (_event, command: string) => {
  return new Promise((resolve) => {
    const child = spawn('sh', ['-c', command])
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      resolve({
        stdout,
        stderr: stderr || (code !== 0 ? `Process exited with code ${code}` : '')
      })
    })

    child.on('error', (error) => {
      resolve({
        stdout,
        stderr: error.message
      })
    })
  })
})

ipcMain.handle('system:get-system-info', async () => {
  return {
    nodeVersion: process.version,
    osInfo: `${os.type()} ${os.release()}`,
    architecture: os.arch(),
    hostname: os.hostname(),
    totalMemory: os.totalmem(),
    availableMemory: os.freemem()
  }
})
