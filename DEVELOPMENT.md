# Development Guide

## VS Code Tasks & Shortcuts

This project includes comprehensive VS Code tasks to streamline development. Access them via:

- **Command Palette**: `Cmd+Shift+P` → "Tasks: Run Task"
- **Keyboard Shortcuts** (see below)
- **Terminal Menu**: Terminal → Run Task

### 🚀 Development Tasks

| Task                  | Shortcut      | Description                   |
| --------------------- | ------------- | ----------------------------- |
| 🚀 Start Dev Server   | `Cmd+Shift+D` | Start Vite development server |
| 🔄 Restart Dev Server | `Cmd+Shift+R` | Stop and restart dev server   |
| 🛑 Stop All Servers   | -             | Kill all Vite processes       |
| 🌐 Open in Browser    | `Cmd+Shift+O` | Open app in default browser   |

### 🏗️ Build Tasks

| Task                  | Shortcut      | Description                       |
| --------------------- | ------------- | --------------------------------- |
| 🏗️ Build Production   | `Cmd+Shift+B` | Build optimized production bundle |
| 👀 Preview Production | -             | Preview production build locally  |
| 🧹 Clean Build        | -             | Remove dist and cache folders     |
| 🔄 Fresh Install      | -             | Clean install dependencies        |

### 🔍 Code Quality Tasks

| Task                    | Shortcut      | Description                 |
| ----------------------- | ------------- | --------------------------- |
| 🔍 Lint Code            | `Cmd+Shift+L` | Run ESLint on all files     |
| 🔧 Fix Lint Issues      | -             | Auto-fix ESLint issues      |
| 📦 Install Dependencies | -             | Install/update npm packages |

### 🐳 Docker Tasks

| Task                       | Shortcut      | Description                  |
| -------------------------- | ------------- | ---------------------------- |
| 🐳 Check Docker Connection | `Cmd+Shift+T` | Test Docker API connectivity |
| 🐋 List Docker Containers  | -             | Show all Docker containers   |
| 📊 Docker System Info      | -             | Display Docker disk usage    |

### 🚀 Quick Setup Task

| Task              | Description                                               |
| ----------------- | --------------------------------------------------------- |
| 🚀 Full Dev Setup | Install deps → Check Docker → Start server → Open browser |

## Debug Configurations

### 🌐 Launch Chrome (Container Manager)

- Launches Chrome with the app pre-loaded
- Enables source maps for debugging
- Includes basic Chrome debugging setup

### 🐳 Debug with Docker API Access

- Same as above but with disabled web security
- Allows Docker API calls without CORS issues
- **Development only** - never use in production

### 🔍 Attach to Chrome

- Attach debugger to existing Chrome instance
- Useful for debugging running applications

## Development Workflow

### Starting Development

```bash
# Option 1: Use VS Code task (recommended)
Cmd+Shift+P → "Tasks: Run Task" → "🚀 Start Dev Server"

# Option 2: Use keyboard shortcut
Cmd+Shift+D

# Option 3: Use terminal
npm run dev
```

### Restarting Server

```bash
# Option 1: Use VS Code task
Cmd+Shift+R

# Option 2: Manual restart
Ctrl+C (in terminal) → npm run dev
```

### Building for Production

```bash
# Use VS Code task (recommended)
Cmd+Shift+B

# Or manually
npm run build
```

### Docker Development

1. **Enable Docker API** (required):

   - Docker Desktop: Settings → General → "Expose daemon on tcp://localhost:2375 without TLS"
   - Linux: Edit `/etc/docker/daemon.json` (see DOCKER_SETUP.md)

2. **Test Connection**:

   ```bash
   # Use VS Code task
   Cmd+Shift+T

   # Or manually
   npm run docker:check
   ```

3. **Debug with CORS disabled**:
   - Use "🐳 Debug with Docker API Access" launch configuration
   - Or run Chrome manually: `chrome --disable-web-security --user-data-dir=/tmp/chrome_dev`

## Keyboard Shortcuts Summary

| Shortcut      | Action                  |
| ------------- | ----------------------- |
| `Cmd+Shift+D` | Start dev server        |
| `Cmd+Shift+R` | Restart dev server      |
| `Cmd+Shift+B` | Build production        |
| `Cmd+Shift+L` | Lint code               |
| `Cmd+Shift+O` | Open in browser         |
| `Cmd+Shift+T` | Check Docker connection |

## Troubleshooting

### Dev Server Won't Start

1. Check if port 5173 is in use: `lsof -i :5173`
2. Kill existing processes: `pkill -f vite`
3. Try restarting: `Cmd+Shift+R`

### Docker Connection Issues

1. Run Docker connection check: `Cmd+Shift+T`
2. Enable Docker API (see DOCKER_SETUP.md)
3. Use Chrome with disabled security for development

### TypeScript Errors

1. Run type check: `npm run type-check`
2. Restart TypeScript server: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

### Build Errors

1. Clean build: Run "🧹 Clean Build" task
2. Fresh install: Run "🔄 Fresh Install" task
3. Check for dependency conflicts

## VS Code Extensions

Recommended extensions (auto-suggested when opening project):

- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- GitHub Copilot
- Docker (for Docker file support)

## Performance Tips

- Use "🔄 Restart Dev Server" instead of manual restarts
- Keep Docker Desktop running to avoid connection errors
- Use the debug configurations for better debugging experience
- Clean build cache occasionally with "🧹 Clean Build"
