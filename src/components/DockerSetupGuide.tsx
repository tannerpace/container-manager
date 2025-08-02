import './DockerSetupGuide.css'

interface DockerSetupGuideProps {
  onClose: () => void
}

export function DockerSetupGuide({ onClose }: DockerSetupGuideProps) {
  return (
    <div className="setup-guide-overlay">
      <div className="setup-guide-modal">
        <div className="setup-guide-header">
          <h2>🐳 Docker API Setup Required</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="setup-guide-content">
          <p>To connect to your Docker daemon, you need to enable API access:</p>
          
          <div className="setup-section">
            <h3>📱 Docker Desktop (Recommended)</h3>
            <ol>
              <li>Open Docker Desktop</li>
              <li>Go to <strong>Settings</strong> → <strong>General</strong></li>
              <li>Enable <strong>"Expose daemon on tcp://localhost:2375 without TLS"</strong></li>
              <li>Click <strong>Apply & Restart</strong></li>
              <li>Refresh this page</li>
            </ol>
          </div>

          <div className="setup-section">
            <h3>🐧 Docker on Linux</h3>
            <ol>
              <li>Edit <code>/etc/docker/daemon.json</code>:</li>
              <li>
                <pre>{`{
  "hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2375"]
}`}</pre>
              </li>
              <li>Restart Docker: <code>sudo systemctl restart docker</code></li>
            </ol>
          </div>

          <div className="setup-section warning">
            <h3>⚠️ CORS Issues</h3>
            <p>The Docker API doesn't set CORS headers. If you still can't connect after enabling the API:</p>
            <ul>
              <li>Use Chrome with disabled security: <code>chrome --disable-web-security --user-data-dir=/tmp/chrome_dev</code></li>
              <li>Or install a CORS browser extension</li>
              <li>For production, consider using a proxy server</li>
            </ul>
          </div>

          <div className="setup-section security">
            <h3>🔒 Security Note</h3>
            <p>
              Exposing Docker API without TLS is <strong>only for development</strong>. 
              In production, always use TLS authentication and restrict access.
            </p>
          </div>
        </div>

        <div className="setup-guide-footer">
          <button className="retry-btn" onClick={onClose}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
