import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import "./App.css"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { Header } from "./components/Header"
import { Sidebar } from "./components/Sidebar"
import { DockerProvider } from "./context/DockerContext"
import { TerminalProvider } from "./context/TerminalContext"
import { useTerminal } from "./hooks/useTerminal"
import ContainersPage from "./pages/ContainersPage"
import ImagesPage from "./pages/ImagesPage"
import NetworksPage from "./pages/NetworksPage"
import NotFoundPage from "./pages/NotFoundPage"
import VolumesPage from "./pages/VolumesPage"


function AppContent() {
  const { isTerminalModalOpen } = useTerminal()
  return (
    <Router>
      <div className="app">
        {!isTerminalModalOpen && <Header />}
        <div className="app-body">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/containers" replace />} />
              <Route path="/containers" element={<ContainersPage />} />
              <Route path="/images" element={<ImagesPage />} />
              <Route path="/volumes" element={<VolumesPage />} />
              <Route path="/networks" element={<NetworksPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
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
