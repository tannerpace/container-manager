import React from "react"
import { ActionButton } from "../ActionButton"
import type { DockerContainer } from "../../types/docker"
import "./ActionButtonsList.css"

export interface ActionButtonConfig {
  key: string
  action: string
  icon: string
  tooltip: string
  variant?: "primary" | "secondary" | "success" | "warning" | "danger"
  condition?: (container: DockerContainer) => boolean
}

interface ActionButtonsListProps {
  container: DockerContainer
  onAction: (action: string, containerId: string) => void
  onContainerSelect: (containerId: string) => void
}

export const ActionButtonsList: React.FC<ActionButtonsListProps> = ({
  container,
  onAction,
  onContainerSelect,
}) => {
  // Define all possible action buttons with their configurations
  const actionConfigs: ActionButtonConfig[] = [
    {
      key: "details",
      action: "details",
      icon: "🔍",
      tooltip: "View details",
      variant: "primary",
    },
    {
      key: "terminal",
      action: "terminal",
      icon: "💻",
      tooltip: "Open terminal",
      variant: "success",
      condition: (container) => container.State?.toLowerCase() === "running",
    },
    {
      key: "start",
      action: "start",
      icon: "▶️",
      tooltip: "Start container",
      variant: "success",
      condition: (container) =>
        container.State?.toLowerCase() !== "running" &&
        container.State?.toLowerCase() !== "paused",
    },
    {
      key: "stop",
      action: "stop",
      icon: "⏹️",
      tooltip: "Stop container",
      variant: "warning",
      condition: (container) =>
        container.State?.toLowerCase() === "running" ||
        container.State?.toLowerCase() === "paused",
    },
    {
      key: "restart",
      action: "restart",
      icon: "🔄",
      tooltip: "Restart container",
      variant: "warning",
      condition: (container) => container.State?.toLowerCase() === "running",
    },
    {
      key: "pause",
      action: "pause",
      icon: "⏸️",
      tooltip: "Pause container",
      variant: "warning",
      condition: (container) => container.State?.toLowerCase() === "running",
    },
    {
      key: "unpause",
      action: "unpause",
      icon: "▶️",
      tooltip: "Unpause container",
      variant: "success",
      condition: (container) => container.State?.toLowerCase() === "paused",
    },
    {
      key: "rename",
      action: "rename",
      icon: "✏️",
      tooltip: "Rename container",
      variant: "secondary",
    },
    {
      key: "export",
      action: "export",
      icon: "📦",
      tooltip: "Export as image",
      variant: "secondary",
    },
    {
      key: "copy",
      action: "copy",
      icon: "📋",
      tooltip: "Copy container",
      variant: "secondary",
    },
    {
      key: "remove",
      action: "remove",
      icon: "🗑️",
      tooltip: "Remove container",
      variant: "danger",
    },
  ]

  // Filter buttons based on container state and conditions
  const visibleButtons = actionConfigs.filter((config) =>
    config.condition ? config.condition(container) : true
  )

  const handleButtonClick = (action: string) => {
    if (action === "details") {
      onContainerSelect(container.Id)
    } else {
      onAction(action, container.Id)
    }
  }

  return (
    <div className="action-buttons">
      {visibleButtons.map((config) => (
        <ActionButton
          key={config.key}
          onClick={() => handleButtonClick(config.action)}
          className={`${config.key}-btn`}
          tooltip={config.tooltip}
          icon={config.icon}
          variant={config.variant}
        />
      ))}
    </div>
  )
}
