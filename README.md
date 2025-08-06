# To start use vs code task

clean clean build
build build production
start start electron app

# Container Manager

A modern Docker Desktop clone built with React, TypeScript, and Vite. This application provides a clean and intuitive interface for managing Docker containers, images, volumes, and networks.

## ⚠️ Security Notice

**IMPORTANT**: This application connects to Docker API on `localhost:2375` without TLS encryption for development convenience. This configuration:

- Exposes Docker daemon without authentication
- Should **NEVER** be used in production environments
- Could allow unauthorized access to your Docker daemon
- Is intended for local development only

**For production use**, implement proper Docker API authentication and TLS encryption.

## Features

- 🐳 **Container Management**: View, start, stop, and remove Docker containers
- 💿 **Image Management**: Browse and manage Docker images
- 💾 **Volume Management**: View and manage Docker volumes
- 🌐 **Network Management**: Monitor Docker networks
- 🔄 **Real-time Updates**: Live status updates for containers and resources
- 🎨 **Modern UI**: Dark theme with responsive design
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API with useReducer
- **Styling**: CSS Modules with modern CSS features
- **Docker Integration**: Docker Engine API (REST endpoints)

## Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop or Docker Engine running
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/tannerpace/container-manager.git
cd container-manager
```

2. Install dependencies:

```bash
npm install
```

3. **Enable Docker API access** (Required):

Option 1: Colima (macOS, tested)

Colima is an open-source container runtime that can be used as a lightweight alternative to Docker Desktop:

colima start

> ⚠️ Note: This setup has only been tested on macOS with Colima

Linux an PC setups should work, but are untested.

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

**Note:** If you see a connection error, the app will show a setup guide with detailed instructions.

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx       # Top navigation bar
│   ├── Sidebar.tsx      # Left navigation sidebar
│   ├── MainContent.tsx  # Main content area router
│   ├── ContainersList.tsx # Container management view
│   ├── ImagesList.tsx   # Images management view
│   ├── VolumesList.tsx  # Volumes management view
│   └── NetworksList.tsx # Networks management view
├── context/             # React context providers
│   └── DockerContext.tsx # Docker API state management
└── styles/              # CSS modules and global styles
```

## Features Overview

### Container Management

- View all containers with their status, ports, and resource usage
- Start, stop, and remove containers with one click
- Real-time status updates
- Port mapping visualization

### Image Management

- Browse local Docker images
- View image sizes, tags, and creation dates
- Remove unused images
- Repository and tag information

### Volume Management

- List all Docker volumes
- View mount points and driver information
- Volume usage tracking

### Network Management

- Monitor Docker networks
- View network drivers and configurations
- Container network associations

## Development

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## Roadmap

- [x] Real Docker Engine API integration
- [x] Container logs viewer
- [x] Container terminal access
- [x] Image building interface
- [ ] Docker Compose support
- [ ] Multi-host Docker management
- [x] Resource usage monitoring
- [x] Container health checks
- [ ] Registry integration

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

```js
// eslint.config.js
import js from "@eslint/js"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import { globalIgnores } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
```

```

```
