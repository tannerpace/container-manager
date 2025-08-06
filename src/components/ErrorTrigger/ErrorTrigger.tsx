import { useState } from "react"

/**
 * Test component to trigger errors for testing the ErrorBoundary
 * This component should be removed in production or only used in development
 */
export const ErrorTrigger = () => {
  const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    throw new Error("Test error triggered by ErrorTrigger component")
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 9999,
        display: process.env.NODE_ENV === "development" ? "block" : "none",
      }}
    >
      <button
        onClick={() => setShouldError(true)}
        style={{
          background: "#dc3545",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "0.25rem",
          cursor: "pointer",
          fontSize: "0.875rem",
        }}
      >
        🧪 Test Error Boundary
      </button>
    </div>
  )
}
