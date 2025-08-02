# Container Manager

A modern Docker Desktop clone built with React, TypeScript, and Vite. This application provides a clean and intuitive interface for managing Docker containers, images, volumes, and networks.

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
git clone https://github.com/your-username/container-manager.git
cd container-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

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

### Mock Data
Currently, the application uses mock data for demonstration purposes. To connect to a real Docker daemon, you'll need to:

1. Implement Docker Engine API calls in `src/context/DockerContext.tsx`
2. Handle CORS issues when calling Docker API from browser
3. Consider using a backend proxy or Electron for direct Docker API access

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## Roadmap

- [ ] Real Docker Engine API integration
- [ ] Container logs viewer
- [ ] Container terminal access
- [ ] Image building interface
- [ ] Docker Compose support
- [ ] Multi-host Docker management
- [ ] Resource usage monitoring
- [ ] Container health checks
- [ ] Registry integration

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Docker Desktop
- Built with modern React patterns and TypeScript
- Uses Vite for optimal development experience
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
