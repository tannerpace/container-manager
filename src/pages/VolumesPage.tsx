import { useNavigate } from 'react-router-dom';
import { VolumesList } from '../components/VolumesList';

const VolumesPage: React.FC = () => {
	const navigate = useNavigate();
	return <VolumesList onVolumeSelect={(volumeName) => navigate(`/volume_details/${volumeName}`)} />;
};

export default VolumesPage;
