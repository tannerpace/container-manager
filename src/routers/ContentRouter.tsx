import { Navigate, Route, Routes } from "react-router-dom";
import { ImagesComponent } from "../components/Images/ImagesComponent";
import { NetworksList } from "../components/Networks/NetworksList";
import { VolumesList } from "../components/Volumes/VolumesList";
import { ContainersList } from '../components/Containers/ContainersList';

interface ContentRouterProps {
  activeTab: "containers" | "images" | "volumes" | "networks";
}

export function ContentRouter({ activeTab }: ContentRouterProps) {
  return (
    <Routes>
      <Route
        path="/containers"
        element={<ContainersList/>}
      />
      <Route path="/images" element={<ImagesComponent />} />
      <Route path="/volumes" element={<VolumesList />} />
      <Route path="/networks" element={<NetworksList />} />
      <Route path="*" element={<Navigate to={`/${activeTab}`} replace />} />
    </Routes>
  );
}
