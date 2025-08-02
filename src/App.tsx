import { useState } from 'react'
import './App.css'
import { Header } from './components/Header'
import { MainContent } from './components/MainContent'
import { Sidebar } from './components/Sidebar'
import { DockerProvider } from './context/DockerContext'

function App() {
  const [activeTab, setActiveTab] = useState<'containers' | 'images' | 'volumes' | 'networks'>('containers')

  return (
    <DockerProvider>
      <div className="app">
        <Header />
        <div className="app-body">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <MainContent activeTab={activeTab} />
        </div>
      </div>
    </DockerProvider>
  )
}

export default App
