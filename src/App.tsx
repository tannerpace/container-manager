import { useState } from "react"
import "./App.css"
import { ContainerDetails } from "./components/ContainerDetails/ContainerDetails"
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

  return (
    <div className="app">
      {!isTerminalModalOpen && <Header />}
      <div className="app-body">
        {selectedContainerId ? (
          <ContainerDetails
            containerId={selectedContainerId}
            onClose={() => setSelectedContainerId(null)}
          />
        ) : (
          <>
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <MainContent
              activeTab={activeTab}
              onContainerSelect={setSelectedContainerId}
            />
          </>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <DockerProvider>
      <TerminalProvider>
        <AppContent />
      </TerminalProvider>
    </DockerProvider>
  )
}

export default App
