import React, { useEffect } from "react"
import { useTerminal } from "../../hooks/useTerminal"
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
  const { setTerminalModalOpen } = useTerminal()

  useEffect(() => {
    console.log("TerminalModal - setting isOpen to:", isOpen)
    setTerminalModalOpen(isOpen)

    // Add/remove fullscreen class to body for proper styling
    if (isOpen) {
      document.body.classList.add("terminal-modal-fullscreen")
    } else {
      document.body.classList.remove("terminal-modal-fullscreen")
    }

    // Cleanup when component unmounts
    return () => {
      setTerminalModalOpen(false)
      document.body.classList.remove("terminal-modal-fullscreen")
    }
  }, [isOpen, setTerminalModalOpen])

  if (!isOpen) return null

  const handleClose = () => {
    setTerminalModalOpen(false)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose()
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
          onClose={handleClose}
          showHeader={false}
        />
      </div>
    </div>
  )
}
