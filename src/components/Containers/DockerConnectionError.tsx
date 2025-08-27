import { WhaleIcon } from '../shared/WhaleIcon'


interface DockerConnectionErrorProps {
	onShowGuide: () => void
}

/**
 * Shows a Docker connection error and a button to open the setup guide.
 */
export function DockerConnectionError({ onShowGuide }: DockerConnectionErrorProps) {
	return (
		<div className="docker-connection-error">
			<div className="error-content">
				<h3>
					<WhaleIcon size={24} alt="Docker whale" /> Docker Connection Required
				</h3>
				<p>
					Unable to connect to Docker daemon. Make sure Docker is running and API access is enabled.
				</p>
				<button className="setup-guide-btn" onClick={onShowGuide}>
					Show Setup Guide
				</button>
			</div>
		</div>
	)
}
