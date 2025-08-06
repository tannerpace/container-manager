# Copilot Instructions for Container Manager

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Docker Desktop clone built with React, TypeScript, and Vite. The application provides a modern GUI for managing Docker containers, images, volumes, networks, and other Docker resources.

## Key Technologies
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules or Styled Components
- **State Management**: React Context API or Zustand
- **Docker Integration**: Docker Engine API via REST calls
- **Desktop**: Potential Electron or Tauri integration

## Architecture Guidelines
- Use functional components with React hooks
- Implement proper TypeScript types for all Docker API responses
- Create reusable components for common Docker operations
- Follow React best practices for state management
- Use proper error handling for Docker API calls

## Code Style
- Use TypeScript strict mode
- Prefer named exports over default exports
- Use descriptive variable and function names
- Add JSDoc comments for complex functions
- Follow ESLint configuration

## Docker Integration Notes
- Use Docker Engine API (REST) for all Docker operations
- Handle Docker daemon connection states gracefully
- Implement proper loading states for async operations
- Cache frequently accessed data (containers, images)
- Provide real-time updates for container status changes
