import React from "react"
import { Terminal } from "./Terminal"
import "./TerminalModal.css"

interface TerminalModalProps {
  containerId: string
  containerName?: string
  isOpen: boolean
  onClose: () => void
}

export function TerminalModal({
  containerId,
  containerName,
  isOpen,
  onClose,
}: TerminalModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    }
  }

  return (
    <div
      className="terminal-modal-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="terminal-modal-content">
        <Terminal
          containerId={containerId}
          containerName={containerName}
          onClose={onClose}
        />
      </div>
    </div>
  )
}
