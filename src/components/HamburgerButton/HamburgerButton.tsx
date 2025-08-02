import React from "react"
import "./HamburgerButton.css"

interface HamburgerButtonProps {
  onClick: (event: React.MouseEvent) => void
  disabled?: boolean
}

export const HamburgerButton: React.FC<HamburgerButtonProps> = ({
  onClick,
  disabled = false,
}) => {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation() // Prevent row click
    if (!disabled) {
      onClick(event)
    }
  }

  return (
    <button
      className="hamburger-button"
      onClick={handleClick}
      disabled={disabled}
      aria-label="Container actions"
      type="button"
    >
      <span className="hamburger-icon">
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </span>
    </button>
  )
}
