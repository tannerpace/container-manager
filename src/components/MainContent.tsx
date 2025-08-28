import { BrowserRouter as Router } from "react-router-dom";
import { useMainContentConnection } from "../hooks/useMainContentConnection";
import { ContentRouter } from "../routers/ContentRouter";
import { DockerConnectionError } from './Containers/DockerConnectionError';
import { DockerSetupGuide } from './Containers/DockerSetupGuide';

import "./MainContent.css";

interface MainContentProps {
  activeTab: "containers" | "images" | "volumes" | "networks";

}

export function MainContent({ activeTab }: MainContentProps) {
  const { shouldShowSetupGuide, showSetupGuide, setShowSetupGuide } = useMainContentConnection();

  return (
    <main className="main-content">
      {shouldShowSetupGuide && !showSetupGuide && (
        <DockerConnectionError onShowGuide={() => setShowSetupGuide(true)} />
      )}

      <Router>
        <ContentRouter activeTab={activeTab} />
      </Router>

      {showSetupGuide && (
        <DockerSetupGuide onClose={() => setShowSetupGuide(false)} />
      )}
    </main>
  );
}
