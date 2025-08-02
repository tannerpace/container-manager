# Docker API Setup Guide

## Quick Start

To connect Container Manager to your Docker daemon, you need to enable Docker Engine API access:

### Docker Desktop (Recommended)

1. **Open Docker Desktop**
2. **Go to Settings** → **General**  
3. **Enable** "Expose daemon on tcp://localhost:2375 without TLS"
4. **Click** "Apply & Restart"
5. **Refresh** Container Manager

### Docker on Linux

Edit `/etc/docker/daemon.json`:
```json
{
  "hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2375"]
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

## Troubleshooting

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
