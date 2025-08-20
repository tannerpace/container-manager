import React from 'react';

interface NetworkDetailsProps {
  networkId: string;
  onClose: () => void;
}

export const NetworkDetails: React.FC<NetworkDetailsProps> = ({ networkId, onClose }) => {
  // TODO: Fetch and display network details using networkId
  return (
    <div>
      <h2>Network Details: {networkId}</h2>
      <button onClick={onClose}>Close</button>
    </div>
  );
};
