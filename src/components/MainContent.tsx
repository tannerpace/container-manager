
import { useMainContentConnection } from "../hooks/useMainContentConnection"
import { ContainersList } from "./ContainersList"
import { DockerConnectionError } from './DockerConnectionError'
import { DockerSetupGuide } from "./DockerSetupGuide"
import { ImagesComponent } from "./ImagesComponent"
import "./MainContent.css"
import { NetworksList } from "./NetworksList"
import { VolumesList } from "./VolumesList"

interface MainContentProps {
  activeTab: "containers" | "images" | "volumes" | "networks"
  onContainerSelect: (containerId: string) => void
}

export function MainContent({ activeTab, onContainerSelect }: MainContentProps) {
  const { shouldShowSetupGuide, showSetupGuide, setShowSetupGuide } = useMainContentConnection();

  const renderContent = () => {
    switch (activeTab) {
      case "containers":
        return <ContainersList onContainerSelect={onContainerSelect} />;
      case "images":
        return <ImagesComponent />;
      case "volumes":
        return <VolumesList />;
      case "networks":
        return <NetworksList />;
      default:
        return <ContainersList onContainerSelect={onContainerSelect} />;
    }
  };

  return (
    <main className="main-content">
      {shouldShowSetupGuide && !showSetupGuide && (
        <DockerConnectionError onShowGuide={() => setShowSetupGuide(true)} />
      )}

      {renderContent()}

      {showSetupGuide && (
        <DockerSetupGuide onClose={() => setShowSetupGuide(false)} />
      )}
    </main>
  );
}
