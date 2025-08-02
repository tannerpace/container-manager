import "./DockerSetupGuide.css"

interface DockerSetupGuideProps {
  onClose: () => void
}

export function DockerSetupGuide({ onClose }: DockerSetupGuideProps) {
  return (
    <div className="setup-guide-overlay">
      <div className="setup-guide-modal">
        <div className="setup-guide-header">
          <h2>🐳 Docker API Setup Required</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="setup-guide-content">
          <p>
            To connect to your Docker daemon, you need to enable API access.
            Choose your setup method (no sudo required):
          </p>

          <div className="setup-section recommended">
            <h3>🍎 macOS (Recommended - No sudo)</h3>
            <div className="alternatives">
              <div className="alternative">
                <h4>Colima (Lightweight & Fast)</h4>
                <pre>{`# Install via Homebrew
brew install colima

# Start with API enabled
colima start --api --cpu 2 --memory 4

# Verify it's running
curl http://localhost:2375/version`}</pre>
              </div>
              <div className="alternative">
                <h4>OrbStack (Modern Docker Alternative)</h4>
                <pre>{`# Install via Homebrew
brew install orbstack

# Start OrbStack
orb start

# API automatically available at localhost:2375`}</pre>
              </div>
            </div>
          </div>

          <div className="setup-section">
            <h3>� Docker Desktop</h3>
            <ol>
              <li>Open Docker Desktop</li>
              <li>
                Go to <strong>Settings</strong> → <strong>General</strong>
              </li>
              <li>
                Enable{" "}
                <strong>
                  "Expose daemon on tcp://localhost:2375 without TLS"
                </strong>
              </li>
              <li>
                Click <strong>Apply & Restart</strong>
              </li>
              <li>Refresh this page</li>
            </ol>
          </div>

          <div className="setup-section">
            <h3>🪟 Windows (No Admin Required)</h3>
            <div className="alternatives">
              <div className="alternative">
                <h4>WSL2 + Rootless Docker</h4>
                <ol>
                  <li>
                    Install WSL2: <code>wsl --install</code> (one-time admin)
                  </li>
                  <li>Inside WSL2, install rootless Docker:</li>
                  <li>
                    <pre>{`# No sudo needed inside WSL2
curl -fsSL https://get.docker.com/rootless | sh
export PATH=$HOME/bin:$PATH
export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/docker.sock`}</pre>
                  </li>
                  <li>
                    Start Docker with API:{" "}
                    <code>dockerd-rootless.sh --api-cors-header="*"</code>
                  </li>
                </ol>
              </div>
              <div className="alternative">
                <h4>Docker Desktop for Windows</h4>
                <p>
                  Install from Microsoft Store or docker.com, then follow Docker
                  Desktop setup above.
                </p>
              </div>
            </div>
          </div>

          <div className="setup-section">
            <h3>🐧 Linux (User-space Installation)</h3>
            <div className="alternatives">
              <div className="alternative">
                <h4>Rootless Docker (Recommended)</h4>
                <pre>{`# Install in user space (no sudo)
curl -fsSL https://get.docker.com/rootless | sh

# Add to your shell profile (~/.bashrc, ~/.zshrc)
export PATH=$HOME/bin:$PATH
export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/docker.sock

# Start with API enabled
dockerd-rootless.sh --api-cors-header="*" &`}</pre>
              </div>
              <div className="alternative">
                <h4>Podman (Docker-compatible)</h4>
                <pre>{`# Install via package manager (usually available)
# Ubuntu/Debian: apt install podman
# Fedora: dnf install podman
# Arch: pacman -S podman

# Start API service
podman system service --time=0 tcp:localhost:2375 &`}</pre>
              </div>
            </div>
          </div>

          <div className="setup-section">
            <h3>🔐 Advanced: Remote Docker</h3>
            <div className="alternatives">
              <div className="alternative">
                <h4>SSH Tunnel (No server config needed)</h4>
                <pre>{`# Forward remote Docker socket to local port
ssh -L 2375:/var/run/docker.sock user@remote-host

# Then use Container Manager normally`}</pre>
              </div>
              <div className="alternative">
                <h4>Docker Context (Requires Docker CLI)</h4>
                <pre>{`# Create remote context
docker context create remote --docker "host=ssh://user@remote-host"

# Use remote context
docker context use remote`}</pre>
              </div>
            </div>
          </div>

          <div className="setup-section verification">
            <h3>✅ Verify Your Setup</h3>
            <p>Test your Docker API connection:</p>
            <pre>{`curl http://localhost:2375/version`}</pre>
            <p>You should see Docker version information in JSON format.</p>
          </div>

          <div className="setup-section warning">
            <h3>⚠️ CORS Issues</h3>
            <p>
              The Docker API doesn't set CORS headers. If you still can't
              connect after enabling the API:
            </p>
            <ul>
              <li>
                <strong>Development only:</strong> Use Chrome with disabled
                security:
                <code>
                  chrome --disable-web-security --user-data-dir=/tmp/chrome_dev
                </code>
              </li>
              <li>
                Install a CORS browser extension (CORS Unblock, CORS Everywhere)
              </li>
              <li>For production, use a secure proxy server</li>
            </ul>
          </div>

          <div className="setup-section troubleshooting">
            <h3>🔧 Troubleshooting</h3>
            <ul>
              <li>
                <strong>Colima not starting:</strong> Try{" "}
                <code>colima delete</code> then <code>colima start --api</code>
              </li>
              <li>
                <strong>Port already in use:</strong> Check if another Docker
                service is running
              </li>
              <li>
                <strong>Connection refused:</strong> Ensure your Docker service
                is running
              </li>
              <li>
                <strong>API not responding:</strong> Verify port 2375 is open:{" "}
                <code>lsof -i :2375</code>
              </li>
              <li>
                <strong>Rootless Docker issues:</strong> Check{" "}
                <code>$XDG_RUNTIME_DIR</code> is set
              </li>
            </ul>
          </div>

          <div className="setup-section security">
            <h3>🔒 Security Note</h3>
            <p>
              Exposing Docker API without TLS is{" "}
              <strong>only for development</strong>. In production, always use
              TLS authentication and restrict access.
            </p>
          </div>
        </div>

        <div className="setup-guide-footer">
          <div className="footer-info">
            <p>
              📚 For detailed setup instructions, see{" "}
              <a
                href="https://github.com/your-repo/Container-Manager/blob/main/DOCKER_SETUP.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                DOCKER_SETUP.md
              </a>
            </p>
          </div>
          <button className="retry-btn" onClick={onClose}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
