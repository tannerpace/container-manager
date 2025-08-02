import { useState } from 'react'
import { useDocker } from '../context/DockerContext'
import { ContainersList } from './ContainersList'
import { ImagesList } from './ImagesList'
import './MainContent.css'
import { NetworksList } from './NetworksList'
import { VolumesList } from './VolumesList'
import { DockerSetupGuide } from './DockerSetupGuide'

interface MainContentProps {
  activeTab: 'containers' | 'images' | 'volumes' | 'networks'
}

export function MainContent({ activeTab }: MainContentProps) {
  const { connected, error } = useDocker()
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'containers':
        return <ContainersList />
      case 'images':
        return <ImagesList />
      case 'volumes':
        return <VolumesList />
      case 'networks':
        return <NetworksList />
      default:
        return <ContainersList />
    }
  }

  // Show setup guide if not connected and there's an error
  const shouldShowSetupGuide = !connected && error && error.includes('Unable to connect to Docker daemon')

  return (
    <main className="main-content">
      {shouldShowSetupGuide && !showSetupGuide && (
        <div className="docker-connection-error">
          <div className="error-content">
            <h3>🐳 Docker Connection Required</h3>
            <p>Unable to connect to Docker daemon. Make sure Docker is running and API access is enabled.</p>
            <button 
              className="setup-guide-btn"
              onClick={() => setShowSetupGuide(true)}
            >
              Show Setup Guide
            </button>
          </div>
        </div>
      )}
      
      {renderContent()}
      
      {showSetupGuide && (
        <DockerSetupGuide onClose={() => setShowSetupGuide(false)} />
      )}
    </main>
  )
}
