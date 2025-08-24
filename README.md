# Container Manager

**A lightweight, open source Docker Desktop alternative focused on learning Docker and making container technology accessible to everyone.**

Container Manager is designed for:
- **Learning Docker**: Explore, experiment, and understand Docker concepts in a safe, visual way.
- **Open Source for All**: 100% free for personal, educational, and enterprise use—no paywalls, no restrictions.
- **New Developers Welcome**: Friendly for beginners, with a modern codebase and clear contribution guidelines.
- **Lightweight & Fast**: Minimal dependencies, quick startup, and low resource usage.

This project provides a clean and intuitive interface for managing Docker containers, images, volumes, and networks. It's a great way to learn Docker, contribute to open source, and help others do the same!


> ⚠️ **Security Note:**
> - Exposes Docker daemon without authentication
> - Should **NEVER** be used in production environments
> - Could allow unauthorized access to your Docker daemon
> - Is intended for local development and learning only

For production use, implement proper Docker API authentication and TLS encryption.


## Features

- 🐳 **Container Management**: View, start, stop, and remove Docker containers
- 💿 **Image Management**: Browse and manage Docker images
- 💾 **Volume Management**: View and manage Docker volumes
- 🌐 **Network Management**: Monitor Docker networks
- 🔄 **Real-time Updates**: Live status updates for containers and resources
- 🎨 **Modern UI**: Dark theme with responsive design
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development
- 🧑‍💻 **Beginner Friendly**: Clean code, helpful comments, and a welcoming community

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API with useReducer
- **Styling**: CSS Modules with modern CSS features
- **Docker Integration**: Docker Engine API (REST endpoints)

## Environment Setup & Verification

Before you start, make sure your environment matches these requirements:

### 1. Check your shell

```bash
echo $SHELL
# Should output: /bin/zsh (or your preferred shell)
```

### 2. Check Node.js and npm versions

```bash
node --version
# Should output: v20.x.x or higher

npm --version
# Should output: 10.x.x or higher
```

### 3. Check your OS and architecture

```bash
uname -a
# Example output: Darwin ... arm64 (for Apple Silicon Macs)
```

### 4. Check Docker installation

```bash
which docker
docker --version
# Should output: Docker version 27.x.x or higher
```

### 5. (macOS recommended) Check Colima installation

```bash
which colima
colima version
# Should output: colima version 0.8.x or higher
```

If you see errors or missing tools, please install them before proceeding.

---


# Container Manager

A modern, open-source Docker Desktop alternative built with React, TypeScript, and Vite.

[![Build Status](https://img.shields.io/github/actions/workflow/status/tannerpace/container-manager/ci.yml?branch=main)](https://github.com/tannerpace/container-manager/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Manage Docker containers, images, volumes, and networks**
- **Modern, desktop-friendly UI**
- **Real-time Docker status and updates**
- **Electron and Tauri support (planned)**
- **Cross-platform compatibility**

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [Docker Engine](https://docs.docker.com/engine/install/) running locally

---

## Installation

1. **Enable Docker API access** (Required):

Option 1: Colima (macOS, tested)

Colima is an open-source container runtime that can be used as a lightweight alternative to Docker Desktop:

2. Clone the repository:

```bash
git clone https://github.com/tannerpace/container-manager.git
cd container-manager
```

3. Install dependencies and build

```bash
npm install && npm run build
```

colima start

> ⚠️ Note: This setup has only been tested on macOS with Colima

Linux an PC setups should work, but are untested.

4. Start the development server:

```bash
npm run dev
```

5. Start the electron app

```bash
npm run electron
npm run electron
```

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

To streamline development, the following tasks are available in the project. These tasks can be run directly from the VS Code task runner or the terminal.

### Key Tasks

- **🚀 Start Dev Server**:
  Starts the Vite development server. This task is useful for frontend development and supports hot module replacement (HMR) for CSS and JavaScript changes.

- **⚡ Electron Dev Auto-Reload**:
  Starts the Electron app in development mode with auto-reload enabled. This is the recommended task for developers working on both the frontend and Electron integration. It ensures that changes to CSS, JavaScript, or other assets are reflected immediately in the app without needing a manual restart.

  **Usage**:
  - Make changes to your CSS or other files.
  - The app will automatically reload to reflect the changes.

- **🔍 Lint Code**:
  Runs the linter to check for code quality issues.

- **🔧 Fix Lint Issues**:
  Automatically fixes linting issues where possible.

- **🏗️ Build**:
  Builds the project for production.

- **📦 Install Dependencies**:
  Installs all required dependencies for the project.

For a full list of tasks, refer to the `.vscode/tasks.json` file or the VS Code task runner.

### Contributing & Community

We welcome contributors of all experience levels! Whether you're new to open source or a seasoned developer, your ideas and code are valued here.

**How to get started:**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

**Need help?**
- Check the [issues](https://github.com/tannerpace/container-manager/issues) for good first tasks
- Ask questions or suggest features in Discussions or Issues
- Read the code comments and documentation for guidance

**Why contribute?**
- Learn Docker and modern web development
- Build your portfolio and help others learn
- Join a friendly, growing open source community

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

This project is licensed under the Apache License 2.0 – see the [LICENSE](LICENSE) file for details. Free for all uses, including enterprise.

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


