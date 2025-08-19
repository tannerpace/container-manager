import React from 'react';

interface ImageDetailsProps {
  imageId: string;
  onClose: () => void;
}

export const ImageDetails: React.FC<ImageDetailsProps> = ({ imageId, onClose }) => {
  // TODO: Fetch and display image details using imageId
  return (
    <div>
      <h2>Image Details: {imageId}</h2>
      <button onClick={onClose}>Close</button>
    </div>
  );
};
