/**
 * Electron Preload Script
 * 
 * Securely exposes Electron APIs to the renderer process
 * Acts as a bridge between main and renderer processes
 */


const { contextBridge, ipcRenderer } = require('electron')

/**
 * Docker API exposed to renderer process
 */
const dockerAPI = {
  // Container operations
  listContainers: () => ipcRenderer.invoke('docker:list-containers'),
  inspectContainer: (id: string) => ipcRenderer.invoke('docker:inspect-container', id),
  getContainerStats: (id: string) => ipcRenderer.invoke('docker:get-container-stats', id),
  getContainerLogs: (id: string, options?: Record<string, string>) => ipcRenderer.invoke('docker:get-container-logs', id, options),

  // Container actions
  startContainer: (id: string) => ipcRenderer.invoke('docker:start-container', id),
  stopContainer: (id: string) => ipcRenderer.invoke('docker:stop-container', id),
  restartContainer: (id: string) => ipcRenderer.invoke('docker:restart-container', id),
  pauseContainer: (id: string) => ipcRenderer.invoke('docker:pause-container', id),
  unpauseContainer: (id: string) => ipcRenderer.invoke('docker:unpause-container', id),
  removeContainer: (id: string) => ipcRenderer.invoke('docker:remove-container', id),
  renameContainer: (id: string, name: string) => ipcRenderer.invoke('docker:rename-container', id, name),
  exportContainer: (id: string, repo: string, tag: string) => ipcRenderer.invoke('docker:export-container', id, repo, tag),

  // Image operations
  listImages: () => ipcRenderer.invoke('docker:list-images'),
  removeImage: (id: string) => ipcRenderer.invoke('docker:remove-image', id),

  // Volume operations
  listVolumes: () => ipcRenderer.invoke('docker:list-volumes'),

  // Network operations
  listNetworks: () => ipcRenderer.invoke('docker:list-networks'),

  // System operations
  getSystemInfo: () => ipcRenderer.invoke('docker:get-system-info'),
  ping: () => ipcRenderer.invoke('docker:ping'),
}

// Expose API to renderer process
contextBridge.exposeInMainWorld('dockerAPI', dockerAPI)
