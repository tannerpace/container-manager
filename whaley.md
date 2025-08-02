---
title: "Building a Docker Desktop Clone with React and Electron"
publishedAt: "2025-08-02"
description: "Creating a modern container management application using React, TypeScript, and Electron with native Docker API integration and real-time terminal support."
tag: "Desktop Development"
tags:
  - "React"
  - "TypeScript"
  - "Electron"
  - "Docker"
  - "Vite"
  - "Desktop Applications"
  - "Container Management"
  - "XTerm"
author: "Tanner Bleakley"
---

# Container Manager: A Modern Docker Desktop Alternative

Building desktop applications that interact with system-level services like Docker requires careful consideration of architecture, cross-platform compatibility, and user experience. This article explores the development of Container Manager - a Docker Desktop clone built with React, TypeScript, and Electron that provides comprehensive container management capabilities.

---

## Project Architecture: Bridging Web and Native

Container Manager demonstrates a hybrid approach to desktop application development, combining web technologies with native system access through Electron. The application architecture addresses several key challenges in container management software.

### Technology Stack

- **Frontend**: React 18 with TypeScript for type-safe UI development
- **Build System**: Vite for fast development and optimized production builds
- **Desktop Framework**: Electron for native desktop functionality
- **State Management**: React Context API with useReducer for predictable state updates
- **Terminal Integration**: XTerm.js with WebSocket support for interactive container shells
- **Docker Integration**: Direct Docker Engine API communication via REST endpoints

---

## Docker API Integration: Multiple Connection Strategies

One of the most complex aspects of building a Docker management tool is handling the various ways Docker can be accessed across different platforms and configurations.

### Flexible Configuration System

The application supports multiple Docker connection methods through a configuration system that adapts to different environments:

```typescript
export const DOCKER_CONFIGS = {
  // Docker Desktop on macOS/Windows (TCP with TLS disabled)
  desktop: {
    apiUrl: "http://localhost:2375",
    timeout: 10000,
    retryAttempts: 3,
  },

  // Colima with TCP API enabled
  colimaTCP: {
    apiUrl: "http://localhost:2375",
    timeout: 10000,
    retryAttempts: 3,
  },

  // Colima via Unix socket (for Electron apps)
  colimaSocket: {
    apiUrl:
      "unix:///Users/" +
      (process.env.USER || "user") +
      "/.colima/default/docker.sock",
    timeout: 10000,
    retryAttempts: 3,
  },

  // Docker Desktop with TLS
  desktopTLS: {
    apiUrl: "https://localhost:2376",
    timeout: 10000,
    retryAttempts: 3,
  },
}
```

### Environment Detection

The configuration system automatically detects the runtime environment and selects the appropriate connection method:

```typescript
export const getCurrentDockerConfig = (): DockerConfig => {
  // Check if we're in Electron environment
  const isElectron =
    typeof window !== "undefined" &&
    typeof (window as Window & { electronAPI?: unknown }).electronAPI !==
      "undefined"

  // Check if we're in Node.js environment (Electron main process)
  const isNodeJS = typeof process !== "undefined" && process.versions?.node

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
```

---

## Challenge: Unix Socket Access in Electron Applications

### The Problem

Docker on macOS and Linux typically uses Unix domain sockets for API communication, but web browsers cannot directly access Unix sockets due to security restrictions. Traditional solutions require external proxy servers or socat bridges.

### The Solution: Embedded Socket Bridge

Container Manager includes an embedded TCP-to-Unix-socket bridge that runs directly within the Electron main process, eliminating external dependencies:

```typescript
export class DockerSocketBridge {
  private server: net.Server | null = null
  private socketPath: string
  private tcpPort: number = 2375

  async start(): Promise<boolean> {
    return new Promise((resolve) => {
      this.server = net.createServer((clientSocket) => {
        // Connect to Unix socket when client connects
        const dockerSocket = net.connect(this.socketPath)

        // Pipe data between client and Docker socket
        clientSocket.pipe(dockerSocket)
        dockerSocket.pipe(clientSocket)

        // Handle errors and cleanup
        clientSocket.on("error", (err) => {
          console.warn("Client socket error:", err.message)
          dockerSocket.destroy()
        })

        dockerSocket.on("error", (err) => {
          console.warn("Docker socket error:", err.message)
          clientSocket.destroy()
        })
      })

      this.server.listen(this.tcpPort, "localhost", () => {
        console.log(`Docker bridge running on localhost:${this.tcpPort}`)
        console.log(`Bridging to: ${this.socketPath}`)
        resolve(true)
      })
    })
  }
}
```

This embedded bridge provides several advantages:

- **Zero External Dependencies**: No need for socat or external proxy servers
- **Automatic Startup**: Bridge starts with the application
- **Resource Efficiency**: Minimal overhead compared to external processes
- **Simplified Deployment**: Single executable with all dependencies included

---

## Real-Time Container Management with Type Safety

### Comprehensive Docker API Client

The application features a complete Docker API client that handles all container lifecycle operations with proper TypeScript typing:

```typescript
export class DockerAPIClient {
  private baseURL: string
  private timeout: number = 10000

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(
        `Docker API error: ${response.status} ${response.statusText}`
      )
    }

    // Handle empty responses and different content types
    const text = await response.text()
    const contentType = response.headers.get("content-type")

    if (contentType?.includes("application/json") && text.trim()) {
      return JSON.parse(text)
    }

    return (text || []) as T
  }

  // Container lifecycle operations
  async startContainer(id: string): Promise<void> {
    await this.makeRequest(`/containers/${id}/start`, { method: "POST" })
  }

  async stopContainer(id: string, timeout = 10): Promise<void> {
    await this.makeRequest(`/containers/${id}/stop?t=${timeout}`, {
      method: "POST",
    })
  }

  async createContainer(
    imageId: string,
    containerName?: string
  ): Promise<{ Id: string }> {
    const createConfig = {
      Image: imageId,
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      OpenStdin: false,
      StdinOnce: false,
      ...(containerName && { name: containerName }),
    }

    return this.makeRequest<{ Id: string }>("/containers/create", {
      method: "POST",
      body: JSON.stringify(createConfig),
    })
  }
}
```

### React Context for State Management

The application uses React Context with useReducer for predictable state management across all Docker resources:

```typescript
export function DockerProvider({ children }: DockerProviderProps) {
  const [state, dispatch] = useReducer(dockerReducer, initialState)
  const dockerConfig = getCurrentDockerConfig()

  const refreshContainers = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const containers = await makeDockerAPICall("/containers/json?all=true")
      dispatch({ type: "SET_CONTAINERS", payload: containers })
      dispatch({ type: "SET_CONNECTED", payload: true })
      dispatch({ type: "SET_ERROR", payload: null })
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      })
      dispatch({ type: "SET_CONNECTED", payload: false })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  // Additional resource management functions...
  const contextValue: DockerContextType = {
    ...state,
    refreshContainers,
    refreshImages,
    refreshVolumes,
    refreshNetworks,
    startContainer,
    stopContainer,
    restartContainer,
    // ... other operations
  }

  return (
    <DockerContext.Provider value={contextValue}>
      {children}
    </DockerContext.Provider>
  )
}
```

---

## Interactive Terminal Integration with XTerm.js

### Challenge: Container Shell Access

Providing interactive terminal access to running containers requires WebSocket connections and proper terminal emulation in the browser environment.

### Implementation: XTerm.js with Docker Exec API

Container Manager integrates XTerm.js to provide full terminal functionality:

```typescript
export function Terminal({
  containerId,
  containerName,
  onClose,
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const executeCommand = useCallback(
    async (command: string) => {
      const terminal = xtermRef.current
      if (!terminal) return

      try {
        // Create a new exec instance for the command
        const execResponse = await fetch(
          `http://localhost:2375/containers/${containerId}/exec`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              AttachStdin: true,
              AttachStdout: true,
              AttachStderr: true,
              Tty: true,
              Cmd: ["/bin/sh", "-c", command],
            }),
          }
        )

        const { Id: execId } = await execResponse.json()

        // Start the exec instance and capture output
        const startResponse = await fetch(
          `http://localhost:2375/exec/${execId}/start`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              Detach: false,
              Tty: true,
            }),
          }
        )

        const output = await startResponse.text()
        terminal.write(output)
      } catch (error) {
        terminal.write(`\r\nError: ${error.message}\r\n`)
      }
    },
    [containerId]
  )
}
```

### Terminal Features

- **Full XTerm.js Integration**: Complete terminal emulation with color support
- **Fit Addon**: Automatic terminal resizing
- **Web Links Addon**: Clickable URLs in terminal output
- **Interactive Commands**: Real-time command execution in containers
- **Error Handling**: Graceful handling of connection issues

---

## Development Workflow with VS Code Tasks

Container Manager includes comprehensive VS Code task integration for streamlined development:

### Development Server Tasks

```json
{
  "label": "🚀 Start Dev Server",
  "type": "shell",
  "command": "npm",
  "args": ["run", "dev"],
  "group": { "kind": "build", "isDefault": true },
  "isBackground": true
}
```

### Electron Development Tasks

```json
{
  "label": "🚀 Start Electron Dev",
  "type": "shell",
  "command": "npm",
  "args": ["run", "electron:dev"],
  "group": "build",
  "isBackground": true
}
```

### Docker Integration Tasks

```json
{
  "label": "🐋 Check Docker Connection",
  "type": "shell",
  "command": "curl",
  "args": ["-f", "-s", "http://localhost:2375/version"],
  "group": "test"
}
```

---

## Vite Configuration for Electron Compatibility

The build system is optimized for both web and Electron environments:

```typescript
export default defineConfig({
  plugins: [react()],
  base: "./", // Use relative paths for Electron compatibility
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          xterm: ["@xterm/xterm", "@xterm/addon-fit", "@xterm/addon-web-links"],
          utils: ["axios", "lucide-react"],
        },
      },
    },
  },
  esbuild: {
    minifyIdentifiers: false, // Preserve CSS variables
    target: "es2020",
  },
})
```

---

## The Story Behind "Free Whaley": When Naming Gets Personal

One of the most unexpectedly challenging aspects of building Container Manager wasn't the Docker API integration or the Electron architecture—it was picking a name that felt right.

### The AI-Assisted Naming Journey

I turned to AI to explore different naming possibilities, brainstorming everything from technical descriptors to playful maritime themes. The Docker ecosystem is full of whale imagery, so leaning into that metaphor felt natural.

**Whale Boy** was an early favorite—it had personality and captured the playful spirit I wanted. But something about it didn't sit right; it felt like it might not land well with everyone.

**Whale Buddy** came next, and while it was friendlier and more inclusive, it felt a bit too tame for software that's meant to break free from proprietary alternatives.

### Finding "Free Whaley Face"

Then it hit me: **Free Whaley Face**. The name perfectly captured what this project represents—a whale breaking free from the constraints of proprietary software. But honestly? I went with it because I thought it was funny.

I found this incredible image of a whale bursting through chains, which became the perfect visual metaphor. It's not just about container management; it's about the philosophy that great software should be free and accessible to everyone.

### The Philosophy Behind the Name

The "Free" in Free Whaley Face represents more than just cost—it embodies:

- **Freedom of choice**: Alternative to proprietary Docker Desktop
- **Open development**: Built with transparency and community in mind
- **Liberation from limitations**: Breaking free from resource-heavy alternatives
- **Accessible technology**: Desktop applications that don't require enterprise licenses

Sometimes the hardest technical problems have simple solutions, but naming something that captures both functionality and philosophy? That's where the real challenge lies.

---

## Benefits Achieved

Container Manager demonstrates several key advantages of modern desktop application development:

### Technical Benefits

- **Cross-Platform Compatibility**: Single codebase runs on macOS, Windows, and Linux
- **Native System Integration**: Direct Docker API access without external dependencies
- **Type Safety**: Complete TypeScript coverage prevents runtime errors
- **Real-Time Updates**: Live container status monitoring and updates
- **Modern UI**: React-based interface with responsive design

### Development Benefits

- **Fast Development**: Vite's hot module replacement for rapid iteration
- **Integrated Debugging**: VS Code tasks for streamlined development workflow
- **Modular Architecture**: Reusable components and clear separation of concerns
- **Comprehensive Error Handling**: Graceful degradation and user feedback

### User Experience Benefits

- **Familiar Interface**: Clean, intuitive UI similar to Docker Desktop
- **Interactive Terminals**: Full shell access to running containers
- **Resource Management**: Complete control over containers, images, volumes, and networks
- **Performance**: Lightweight and responsive compared to Docker Desktop

---

## Deployment and Distribution

The application supports multiple deployment strategies:

### Electron Builder Configuration

```json
{
  "appId": "com.container-manager.app",
  "productName": "Container Manager",
  "directories": {
    "output": "dist-electron"
  },
  "files": ["dist/**/*", "dist/electron/**/*"],
  "mac": {
    "category": "public.app-category.developer-tools",
    "icon": "public/freewhaley-256.png"
  }
}
```

### Package Scripts

- **Development**: `npm run electron:dev` - Hot reloading development environment
- **Production Build**: `npm run package` - Creates distributable application
- **Web Version**: `npm run build && npm run preview` - Standalone web application

Container Manager represents a modern approach to desktop application development, combining the flexibility of web technologies with the power of native system integration. The embedded socket bridge solution, comprehensive Docker API integration, and type-safe architecture provide a solid foundation for building sophisticated desktop applications that interact with system-level services.
