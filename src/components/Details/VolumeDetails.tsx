import React from 'react';

interface VolumeDetailsProps {
  volumeName: string;
  onClose: () => void;
}

export const VolumeDetails: React.FC<VolumeDetailsProps> = ({ volumeName, onClose }) => {
  // TODO: Fetch and display volume details using volumeName
  return (
    <div>
      <h2>Volume Details: {volumeName}</h2>
      <button onClick={onClose}>Close</button>
    </div>
  );
};
