/**
 * Electron Main Process
 * 
 * Entry point for the Electron app
 * Sets up native Docker access and IPC handlers
 */

import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { DockerSocketBridge } from './dockerBridge'
import { setupDockerIPC } from './dockerClient'

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
