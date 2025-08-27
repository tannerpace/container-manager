import React from "react"
import "./ActionButton.css"

export interface ActionButtonProps {
  onClick: () => void
  className?: string
  tooltip: string
  icon: string
  disabled?: boolean
  variant?: "primary" | "secondary" | "success" | "warning" | "danger"
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  className = "",
  tooltip,
  icon,
  disabled = false,
  variant = "primary",
  

}) => {
  return (
    <button
      onClick={onClick}
      className={`action-btn ${variant}-btn ${className}`}
      data-tooltip={tooltip}
      disabled={disabled}
    >
      {icon}
    </button>
  )
}
