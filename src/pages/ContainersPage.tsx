
import { useNavigate } from 'react-router-dom';
import { ContainersList } from '../components/ContainersList';

const ContainersPage: React.FC = () => {
	const navigate = useNavigate();
	return (
		<ContainersList onContainerSelect={(containerId) => {
			navigate(`/containers/${containerId}`);
		}} />
	);
};

export default ContainersPage;
