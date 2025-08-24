import { useEffect, useState } from 'react';


interface VolumeDetailsProps {
  volumeName: string;
  onClose: () => void;
}

interface DockerVolumeDetails {
  Name: string;
  Driver: string;
  Mountpoint: string;
  Labels?: Record<string, string>;
  Scope?: string;
  Options?: Record<string, string>;
  CreatedAt?: string;
  [key: string]: unknown;
}

function useVolumeDetails(volumeName: string) {
  const [volumeDetails, setVolumeDetails] = useState<DockerVolumeDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVolumeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/volume_details/${volumeName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch volume details');
        }
        const data: DockerVolumeDetails = await response.json();
        setVolumeDetails(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchVolumeDetails();
  }, [volumeName]);

  return { volumeDetails, loading, error };
}

export const VolumeDetails = ({ volumeName, onClose }: VolumeDetailsProps) => {
  const { volumeDetails, loading, error } = useVolumeDetails(volumeName);

  return (
    <div>
      <h2>Volume Details: {volumeName}</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {!loading && !error && (
        <pre>{JSON.stringify(volumeDetails, null, 2)}</pre>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
};
