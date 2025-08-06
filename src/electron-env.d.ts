/// <reference types="vite/client" />
/// <reference types="electron" />

// Electron API types for renderer process
declare global {
  interface Window {
    electronAPI?: import('./electron/preload').ElectronAPI
  }
}

export { }

