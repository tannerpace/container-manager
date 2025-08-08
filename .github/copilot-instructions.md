# Copilot Instructions for Container Manager

<!--
Use this file to provide workspace-specific custom instructions to GitHub Copilot.
More details: https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file
-->

## Project Overview

**Container Manager** is a modern Docker Desktop alternative built using React, TypeScript, and Vite. It provides a desktop-friendly GUI for managing Docker containers, images, volumes, networks, and other Docker resources via the Docker Engine REST API.

---

## Key Technologies

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules or Styled Components
- **State Management**: React Context API or Zustand
- **Docker Integration**: Docker Engine API (REST)
- **Desktop Runtime (planned)**: Electron or Tauri

---

## Architecture Guidelines

- Use **functional components** and **React hooks** only
- Favor **modular, composable components**
- Always check for **existing utilities, hooks, or components** before creating new ones
- Use **custom hooks** (`useDockerXYZ`) for reusable async Docker logic
- Keep code **DRY**: abstract repeated logic into helpers or utilities
- Create **clear separation of concerns** (UI vs data vs state vs effects)
- Avoid coupling component logic directly to API responses; normalize where possible
- Use feature-based folder structure (`features/containers`, `features/images`, etc.)

---

## Code Style

- Use **TypeScript strict mode**
- Prefer **named exports**
- Use **descriptive function and variable names**
- Include **JSDoc comments** on complex or utility functions
- Use **ESLint** and follow Prettier formatting
- Use **async/await** with `try/catch` for API calls
- Avoid inline styles and logic-heavy JSX
- Ensure **consistency across files** (naming, spacing, imports)

---

## Development Practices

- Before writing a new function, **check if a similar one exists**
- Reuse existing **API clients, types, and components**
- Write **unit tests** for core business logic and utility functions
- Write **integration tests** for complex flows (e.g. container creation)
- Use **mock Docker API responses** during development/test
- Use **console.error sparingly**; prefer error boundaries and logging utilities
- Include meaningful **commit messages** and **code comments** for complex logic
- When touching logic for containers, images, or networks, **check cross-feature impact**

---

## Docker Integration Notes

- Use **Docker Engine REST API** for all operations
- Wrap API calls with **abstractions** (`dockerClient.ts`) to centralize logic
- Handle **Docker daemon connection state** gracefully (e.g., "Docker not running")
- Implement **loading, error, and empty states** for all async UI
- Provide **real-time updates** (polling or WebSocket, if available) for container state
- **Cache** frequently accessed data like containers/images in memory or local state
- Use **types/interfaces** for all Docker API responses (e.g., `ContainerSummary`, `ImageSummary`)

---

## UX Guidelines

- Show **notifications/toasts** for successful or failed Docker actions
- Use **confirmation modals** for destructive actions (e.g., remove container)
- Avoid blocking UI where possible; use **optimistic updates** when safe
- Favor **accessibility** (ARIA roles, keyboard nav, contrast)
- Ensure **responsiveness** across desktop screen sizes
