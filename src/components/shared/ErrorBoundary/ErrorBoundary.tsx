import type { ReactNode } from "react"
import React, { Component } from "react"
import "./ErrorBoundary.css"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the app.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error("Error Boundary caught an error:", error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // You could also log the error to an error reporting service here
    // Example: errorReportingService.captureException(error, { extra: errorInfo })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-container">
            <div className="error-boundary-header">
              <div className="error-icon">⚠️</div>
              <h1>Something went wrong</h1>
            </div>

            <div className="error-boundary-content">
              <p className="error-message">
                The Container Manager encountered an unexpected error and needs
                to recover.
              </p>

              {this.state.error && (
                <details className="error-details">
                  <summary>Error Details</summary>
                  <div className="error-details-content">
                    <h3>Error Message:</h3>
                    <pre className="error-text">{this.state.error.message}</pre>

                    {this.state.error.stack && (
                      <>
                        <h3>Stack Trace:</h3>
                        <pre className="error-stack">
                          {this.state.error.stack}
                        </pre>
                      </>
                    )}

                    {this.state.errorInfo && (
                      <>
                        <h3>Component Stack:</h3>
                        <pre className="error-component-stack">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="error-boundary-actions">
              <button onClick={this.handleReset} className="btn btn-primary">
                🔄 Try Again
              </button>
              <button onClick={this.handleReload} className="btn btn-secondary">
                🔃 Reload App
              </button>
            </div>

            <div className="error-boundary-footer">
              <p className="error-tips">
                <strong>Troubleshooting Tips:</strong>
              </p>
              <ul className="error-tips-list">
                <li>Check if Docker Desktop is running</li>
                <li>Verify Docker daemon is accessible</li>
                <li>Try refreshing the browser</li>
                <li>Check browser console for additional errors</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
