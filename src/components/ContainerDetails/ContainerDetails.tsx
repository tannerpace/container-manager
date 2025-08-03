import React, { useEffect, useState } from "react"
import { dockerAPI } from "../../api/dockerClient"
import type { ContainerStats, DockerContainerDetails } from "../../types/docker"
import { ContainerHeader } from "./components/ContainerHeader"
import { StatsWidget } from "./components/StatsWidget"
import "./ContainerDetails.css"
import { EnvironmentTab } from "./tabs/EnvironmentTab"
import { LogsTab } from "./tabs/LogsTab"
import { NetworkTab } from "./tabs/NetworkTab"
import { OverviewTab } from "./tabs/OverviewTab"
import { TerminalTab } from "./tabs/TerminalTab"
import { VolumesTab } from "./tabs/VolumesTab"

type TabType =
  | "overview"
  | "environment"
  | "network"
  | "volumes"
  | "logs"
  | "terminal"

interface ContainerDetailsProps {
  containerId: string
  onClose: () => void
}

export const ContainerDetails: React.FC<ContainerDetailsProps> = ({
  containerId,
  onClose,
}) => {
  const [containerDetails, setContainerDetails] =
    useState<DockerContainerDetails | null>(null)
  const [containerStats, setContainerStats] = useState<ContainerStats | null>(
    null
  )
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statsCleanup, setStatsCleanup] = useState<(() => void) | null>(null)

  // Load container details
  useEffect(() => {
    const loadContainerDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        const details = await dockerAPI.getContainer(containerId)
        setContainerDetails(details)

        // Start streaming stats if container is running
        if (details.State.Running) {
          // First try to get a single stats reading
          try {
            const singleStats = await dockerAPI.getStats(containerId)
            console.log("Single stats test successful:", singleStats)
            setContainerStats(singleStats)
          } catch (statsError) {
            console.error("Single stats test failed:", statsError)
          }

          const cleanup = await dockerAPI.streamStats(
            containerId,
            (stats) => {
              console.log("Received new stats:", stats)
              setContainerStats(stats)
            },
            (error) => {
              console.error("Stats stream error:", error)
            }
          )
          setStatsCleanup(() => cleanup)
        }
      } catch (err) {
        console.error("Error loading container details:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load container details"
        )
      } finally {
        setLoading(false)
      }
    }

    loadContainerDetails()

    // Cleanup on unmount
    return () => {
      if (statsCleanup) {
        statsCleanup()
      }
    }
  }, [containerId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup stats stream when container stops
  useEffect(() => {
    if (containerDetails && !containerDetails.State.Running && statsCleanup) {
      statsCleanup()
      setStatsCleanup(null)
      setContainerStats(null)
    }
  }, [containerDetails?.State.Running]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleContainerAction = async (action: string) => {
    if (!containerDetails) return

    try {
      switch (action) {
        case "start":
          await dockerAPI.startContainer(containerId)
          break
        case "stop":
          await dockerAPI.stopContainer(containerId)
          break
        case "restart":
          await dockerAPI.restartContainer(containerId)
          break
        case "pause":
          await dockerAPI.pauseContainer(containerId)
          break
        case "unpause":
          await dockerAPI.unpauseContainer(containerId)
          break
        case "remove":
          if (confirm("Are you sure you want to remove this container?")) {
            await dockerAPI.removeContainer(containerId, true)
            onClose() // Close details view after removal
            return
          }
          break
      }

      // Refresh container details after action
      const updatedDetails = await dockerAPI.getContainer(containerId)
      setContainerDetails(updatedDetails)

      // Restart stats streaming if container is now running
      if (updatedDetails.State.Running && !statsCleanup) {
        const cleanup = await dockerAPI.streamStats(
          containerId,
          (stats) => {
            console.log("Received new stats after action:", stats)
            setContainerStats(stats)
          },
          (error) => console.error("Stats stream error:", error)
        )
        setStatsCleanup(() => cleanup)
      }
    } catch (err) {
      console.error(`Error ${action} container:`, err)
      setError(
        err instanceof Error ? err.message : `Failed to ${action} container`
      )
    }
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "environment", label: "Environment", icon: "🌍" },
    { id: "network", label: "Network", icon: "🌐" },
    { id: "volumes", label: "Volumes", icon: "💾" },
    { id: "logs", label: "Logs", icon: "📄" },
    { id: "terminal", label: "Terminal", icon: "💻" },
  ] as const

  if (loading) {
    return (
      <div className="container-details loading">
        <div className="loading-spinner"></div>
        <p>Loading container details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-details error">
        <h3>Error Loading Container</h3>
        <p>{error}</p>
        <button onClick={onClose} className="close-btn">
          Close
        </button>
      </div>
    )
  }

  if (!containerDetails) {
    return (
      <div className="container-details error">
        <h3>Container Not Found</h3>
        <p>The container could not be found or accessed.</p>
        <button onClick={onClose} className="close-btn">
          Close
        </button>
      </div>
    )
  }

  return (
    <>
      <ContainerHeader
        container={containerDetails}
        onAction={handleContainerAction}
        onClose={onClose}
      />

      {containerDetails.State.Running && containerStats && (
        <StatsWidget stats={containerStats} />
      )}

      <div className="details-tabs">
        <div className="tab-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content" style={{ overflowY: "auto" }}>
          {activeTab === "overview" && (
            <OverviewTab container={containerDetails} />
          )}
          {activeTab === "environment" && (
            <EnvironmentTab container={containerDetails} />
          )}
          {activeTab === "network" && (
            <NetworkTab container={containerDetails} />
          )}
          {activeTab === "volumes" && (
            <VolumesTab container={containerDetails} />
          )}
          {activeTab === "logs" && <LogsTab containerId={containerId} />}
          {activeTab === "terminal" && (
            <TerminalTab
              containerId={containerId}
              containerName={containerDetails?.Name?.replace(/^\//, "")}
            />
          )}
        </div>
      </div>
    </>
  )
}
