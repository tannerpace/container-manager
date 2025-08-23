# Docker API Setup Guide

## Overview

Container Manager can work with Docker in several ways:

- ✅ **Docker Desktop** (easiest)
- ✅ **Native Docker Engine** (lightweight, no GUI)
- ✅ **Remote Docker** (via SSH or network)
- ✅ **Docker in containers** (rootless, Docker-in-Docker)

---

## Option 1: Docker Desktop (Recommended for Beginners)

### Install Docker Desktop

- **Windows**: Download from [docker.com](https://www.docker.com/products/docker-desktop/)
- **macOS**: Download from [docker.com](https://www.docker.com/products/docker-desktop/)
- **Linux**: Available for Ubuntu, Debian, Fedora

### Enable API Access

1. **Open Docker Desktop**
2. **Go to Settings** → **General**
3. **Enable** "Expose daemon on tcp://localhost:2375 without TLS"
4. **Click** "Apply & Restart"
5. **Refresh** Container Manager

---

## Option 2: Native Docker Engine (Lightweight Alternative)

### Linux (Ubuntu/Debian)

```bash
# Remove old versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Add your user to docker group (logout/login required)
sudo usermod -aG docker $USER
```

### Linux (CentOS/RHEL/Fedora)

```bash
# Install prerequisites
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker Engine
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Add your user to docker group
sudo usermod -aG docker $USER
```

### macOS (without Docker Desktop)

```bash
# Install using Homebrew
brew install colima

# Start Colima (lightweight Docker runtime)
colima start

# Or use OrbStack (Docker Desktop alternative)
brew install orbstack
```

### Windows (without Docker Desktop)

```powershell
# Install using Chocolatey
choco install docker-engine

# Or use WSL2 with Linux Docker Engine
wsl --install
# Then follow Linux instructions inside WSL2
```

### Enable API Access for Native Docker

```bash
# Edit daemon configuration
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<EOF
{
  "hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2375"],
  "api-cors-header": "*"
}
EOF

# Restart Docker
sudo systemctl restart docker
```

---

## Option 3: Remote Docker Access

### SSH Tunnel Method

```bash
# Forward Docker socket over SSH
ssh -L 2375:/var/run/docker.sock user@remote-host

# Or use Docker context
docker context create remote --docker "host=ssh://user@remote-host"
docker context use remote
```

### Network Access

```bash
# On remote host, edit /etc/docker/daemon.json
{
  "hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2375"],
  "tls": false
}

# Access from Container Manager using remote IP
# Update src/config/docker.ts with remote host IP
```

---

## Option 4: Rootless Docker (Security Focused)

### Install Rootless Docker

```bash
# Install rootless Docker
curl -fsSL https://get.docker.com/rootless | sh

# Set up environment
export PATH=/home/$USER/bin:$PATH
export DOCKER_HOST=unix:///run/user/$(id -u)/docker.sock

# Start rootless Docker
dockerd-rootless.sh --experimental --api-cors-header="*"
```

---

## Container Manager Configuration

### Default Configuration

Container Manager tries these endpoints in order:

1. `http://localhost:2375` (Docker Desktop/Engine with API)
2. `http://localhost:2376` (Docker with TLS - not supported yet)
3. `unix:///var/run/docker.sock` (Direct socket - browser limitation)

### Custom Configuration

Edit `src/config/docker.ts`:

```typescript
export const dockerConfigs = {
  development: {
    apiUrl: "http://localhost:2375", // Change port/host as needed
    timeout: 10000,
  },
  // Add remote configurations
  remote: {
    apiUrl: "http://192.168.1.100:2375",
    timeout: 15000,
  },
}
```

---

## Quick Verification

Test your Docker API setup:

```bash
# Test Docker API directly
curl http://localhost:2375/version

# Test container listing
curl http://localhost:2375/containers/json

# Test with specific host
curl http://YOUR_HOST:2375/version
```

Expected response:

```json
{
  "Platform": { "Name": "Docker Engine - Community" },
  "Components": [{ "Name": "Engine", "Version": "24.0.0" }],
  "Version": "24.0.0",
  "ApiVersion": "1.43",
  "MinAPIVersion": "1.12",
  "GitCommit": "..."
}
```

---

### CORS Issues

The Docker API doesn't set CORS headers. If you still can't connect:

1. **Use Chrome with disabled security** (development only):

   ```bash
   chrome --disable-web-security --user-data-dir=/tmp/chrome_dev
   ```

2. **Install a CORS browser extension**

3. **Use a proxy server** for production

### Connection Errors

- **Docker not running**: Start Docker Desktop or Docker daemon
- **Wrong port**: Check if Docker API is on port 2375 or 2376
- **Firewall**: Ensure port 2375 is not blocked
- **WSL2 on Windows**: Docker Desktop should handle this automatically

## Security Warning

⚠️ **Exposing Docker API without TLS is only for development!**

For production:

- Use TLS authentication
- Restrict access to specific IPs
- Consider using a secure proxy server
- Never expose Docker API to the internet

## API Endpoints Used

Container Manager uses these Docker Engine API endpoints:

- `GET /containers/json?all=true` - List containers
- `GET /images/json` - List images
- `GET /volumes` - List volumes
- `GET /networks` - List networks
- `POST /containers/{id}/start` - Start container
- `POST /containers/{id}/stop` - Stop container
- `DELETE /containers/{id}` - Remove container
- `DELETE /images/{id}` - Remove image

For more details, see the [Docker Engine API documentation](https://docs.docker.com/engine/api/).
