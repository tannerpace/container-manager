import { useCallback, useState } from "react"
import "./App.css"
import { Details } from "./components/Details/Details"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { Header } from "./components/Header"
import { MainContent } from "./components/MainContent"
import { Sidebar } from "./components/Sidebar"
import { DockerProvider } from "./context/DockerContext"
import { TerminalProvider } from "./context/TerminalContext"
import { useTerminal } from "./hooks/useTerminal"

function AppContent() {
  const [activeTab, setActiveTab] = useState<
    "containers" | "images" | "volumes" | "networks"
  >("containers")
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(
    null
  )
  const { isTerminalModalOpen } = useTerminal()

  console.log("App - isTerminalModalOpen:", isTerminalModalOpen)

  const handleContainerSelect = useCallback((containerId: string) => {
    setSelectedContainerId(containerId)
    setActiveTab("containers") // Switch to containers tab when a container is selected
  }, [])

  return (
    <div className="app">
      {!isTerminalModalOpen && <Header />}

      {selectedContainerId && (
        <Details
          containerId={selectedContainerId}
          onClose={() => setSelectedContainerId(null)}
        />
      )}
      <div className="app-body">
        <>
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <MainContent
            activeTab={activeTab}
            onContainerSelect={handleContainerSelect}
          />
        </>
      </div>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <DockerProvider>
        <TerminalProvider>
          <AppContent />
        </TerminalProvider>
      </DockerProvider>
    </ErrorBoundary>
  )
}

export default App
