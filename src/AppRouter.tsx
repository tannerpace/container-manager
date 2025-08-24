import React from 'react';
import {
    Route,
    HashRouter as Router,
    Routes
} from 'react-router-dom';

import { useNavigate, useParams } from 'react-router-dom';
import { ContainerDetails } from './components/Details/ContainerDetails';
import { ImageDetails } from './components/Details/ImageDetails';
import { NetworkDetails } from './components/Details/NetworkDetails';
import { VolumeDetails } from './components/Details/VolumeDetails';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { useTerminal } from './hooks/useTerminal';
import ContainersPage from './pages/ContainersPage';
import ImagesPage from './pages/ImagesPage';
import NetworksPage from './pages/NetworksPage';
import NotFoundPage from './pages/NotFoundPage';
import VolumesPage from './pages/VolumesPage';

function DetailsWrapper() {
  const params = useParams();
  const navigate = useNavigate();
  const containerId = params.containerId;
  if (!containerId) return null;
  return <ContainerDetails containerId={containerId} onClose={() => navigate('/containers')} />;
}

function ImageDetailsWrapper() {
  const params = useParams();
  const navigate = useNavigate();
  const imageId = params.imageId;
  if (!imageId) return null;
  return <ImageDetails imageId={imageId} onClose={() => navigate('/images')} />;
}

function VolumeDetailsWrapper() {
  const params = useParams();
  const navigate = useNavigate();
  const volumeName = params.volumeName;
  if (!volumeName) return null;
  return <VolumeDetails volumeName={volumeName} onClose={() => navigate('/volumes')} />;
}

function NetworkDetailsWrapper() {
  const params = useParams();
  const navigate = useNavigate();
  const networkId = params.networkId;
  if (!networkId) return null;
  return <NetworkDetails networkId={networkId} onClose={() => navigate('/networks')} />;
}

const AppRouter: React.FC = () => {
  const { isTerminalModalOpen } = useTerminal();
  return (
    <Router>
      <div className="app">
        {!isTerminalModalOpen && <Header />}
        <div className="app-body">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ContainersPage />} />
              <Route path="/container_details/:containerId" element={<DetailsWrapper />} />
              <Route path="/image_details/:imageId" element={<ImageDetailsWrapper />} />
              <Route path="/volume_details/:volumeName" element={<VolumeDetailsWrapper />} />
              <Route path="/network_details/:networkId" element={<NetworkDetailsWrapper />} />
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
  );
};

export default AppRouter;
