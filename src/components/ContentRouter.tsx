import { Navigate, Route, Routes } from "react-router-dom";
import { ContainersList } from './Containers/ContainersList';
import { ImagesComponent } from './Images/ImagesComponent';
import { NetworksList } from './Networks/NetworksList';
import { VolumesList } from './Volumes/VolumesList';


interface ContentRouterProps {
  activeTab: "containers" | "images" | "volumes" | "networks";
}

export function ContentRouter({ activeTab }: ContentRouterProps) {
  return (
    <Routes>
      <Route
        path="/containers"
        element={<ContainersList />}
      />
      <Route path="/images" element={<ImagesComponent />} />
      <Route path="/volumes" element={<VolumesList />} />
      <Route path="/networks" element={<NetworksList />} />
      <Route path="*" element={<Navigate to={`/${activeTab}`} replace />} />
    </Routes>
  );
}
