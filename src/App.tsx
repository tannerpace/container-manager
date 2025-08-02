import { useState } from "react"
import "./App.css"
import { ContainerDetails } from "./components/ContainerDetails/ContainerDetails"
import { Header } from "./components/Header"
import { MainContent } from "./components/MainContent"
import { Sidebar } from "./components/Sidebar"
import { DockerProvider } from "./context/DockerContext"

function App() {
  const [activeTab, setActiveTab] = useState<
    "containers" | "images" | "volumes" | "networks"
  >("containers")
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(
    null
  )

  return (
    <DockerProvider>
      <div className="app">
        <Header />
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
    </DockerProvider>
  )
}

export default App
