import React, { useEffect, useRef, useState } from "react"
import { dockerAPI } from "../../../api/dockerClient"
import "./LogsTab.css"

interface LogsTabProps {
  containerId: string
}

export const LogsTab: React.FC<LogsTabProps> = ({ containerId }) => {
  const [logs, setLogs] = useState<string>("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const loadLogsOnMount = async () => {
      try {
        setLoading(true)
        setError(null)
        const logData = await dockerAPI.getContainerLogs(containerId, {
          stdout: true,
          stderr: true,
          timestamps: true,
          tail: 100,
        })
        setLogs(logData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load logs")
      } finally {
        setLoading(false)
      }
    }

    loadLogsOnMount()
  }, [containerId])

  useEffect(() => {
    if (isStreaming) {
      scrollToBottom()
    }
  }, [logs, isStreaming])

  const loadLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const logData = await dockerAPI.getContainerLogs(containerId, {
        stdout: true,
        stderr: true,
        timestamps: true,
        tail: 100,
      })
      setLogs(logData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs")
    } finally {
      setLoading(false)
    }
  }

  const startStreaming = () => {
    setIsStreaming(true)
    dockerAPI.streamLogs(containerId, {
      follow: true,
      stdout: true,
      stderr: true,
      timestamps: true,
      onData: (chunk) => {
        setLogs((prev) => prev + chunk)
      },
      onError: (error) => {
        setError(error.message)
        setIsStreaming(false)
      },
    })
  }

  const stopStreaming = () => {
    setIsStreaming(false)
    // In a real implementation, we'd need to store and cancel the stream
  }

  const clearLogs = () => {
    setLogs("")
  }

  const downloadLogs = () => {
    const blob = new Blob([logs], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `container-${containerId.substring(0, 12)}-logs.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="logs-tab">
      <div className="logs-toolbar">
        <div className="toolbar-section">
          <button
            onClick={loadLogs}
            disabled={loading || isStreaming}
            className="toolbar-btn refresh-btn"
          >
            🔄 Refresh
          </button>

          {!isStreaming ? (
            <button onClick={startStreaming} className="toolbar-btn stream-btn">
              ▶️ Stream
            </button>
          ) : (
            <button onClick={stopStreaming} className="toolbar-btn stop-btn">
              ⏹️ Stop
            </button>
          )}

          <button onClick={clearLogs} className="toolbar-btn clear-btn">
            🗑️ Clear
          </button>

          <button
            onClick={downloadLogs}
            disabled={!logs}
            className="toolbar-btn download-btn"
          >
            💾 Download
          </button>
        </div>

        <div className="toolbar-status">
          {isStreaming && <span className="streaming-indicator">🔴 Live</span>}
          {loading && <span className="loading-indicator">Loading...</span>}
        </div>
      </div>

      <div className="logs-container">
        {error && <div className="error-message">Error: {error}</div>}

        <pre className="logs-content">{logs || "No logs available"}</pre>
        <div ref={logsEndRef} />
      </div>
    </div>
  )
}
