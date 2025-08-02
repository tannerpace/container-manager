import { ContainersList } from './ContainersList'
import { ImagesList } from './ImagesList'
import './MainContent.css'
import { NetworksList } from './NetworksList'
import { VolumesList } from './VolumesList'

interface MainContentProps {
  activeTab: 'containers' | 'images' | 'volumes' | 'networks'
}

export function MainContent({ activeTab }: MainContentProps) {
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

  return (
    <main className="main-content">
      {renderContent()}
    </main>
  )
}
