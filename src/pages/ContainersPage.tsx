import { useNavigate } from 'react-router-dom';
import { ContainersList } from '../components/ContainersList';

const ContainersPage: React.FC = () => {
	const navigate = useNavigate();
	return (
		<ContainersList onContainerSelect={(containerId) => {
			navigate(`/container_details/${containerId}`);
		}} />
	);
};

export default ContainersPage;
