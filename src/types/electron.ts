/**
 * Electron bridge type definitions
 * Consolidated type declarations for the Electron main process bridge
 */

import { ElectronAPI } from '../electron/preload';

export interface ElectronBridge {
	executeAppleScript: (script: string) => Promise<string>
	exec: (command: string) => Promise<{ stdout: string; stderr: string }>
	execLongRunning: (command: string) => Promise<{ stdout: string; stderr: string }>
	executeCommand: (command: string) => Promise<string>
	getSystemInfo: () => Promise<{
		nodeVersion: string
		osInfo: string
		architecture: string
		hostname: string
		totalMemory: number
		availableMemory: number
	}>
}

// Global type declaration for the Electron bridge
declare global {
	interface Window {
		electron?: ElectronBridge | ElectronAPI
	}
}
