import React from "react"
import type { DockerImage } from '../../types/dockerTypes'


interface ImageRowProps {
	image: DockerImage
	isSelected: boolean
	handleSelectImage: (image: DockerImage) => void
	handleAction: (action: string, imageId: string) => void
	formatBytes: (bytes: number) => string
}

/**
 * Row component for a single Docker image in the images table
 */
export const ImageRow: React.FC<ImageRowProps> = ({
	image,
	isSelected,
	handleSelectImage,
	handleAction,
	formatBytes,
}) => {
	return (
		<div
			className={`table-row${isSelected ? ' selected' : ''}`}
			onClick={() => handleSelectImage(image)}
			tabIndex={0}
			style={{ cursor: 'pointer' }}
		>
			<div className="col-repository">
				<div className="image-repo">
					{image.RepoTags?.[0]?.split(":")[0] || "none"}
				</div>
			</div>

			<div className="col-tag">
				<span className="image-tag">
					{image.RepoTags?.[0]?.split(":")[1] || "none"}
				</span>
			</div>

			<div className="col-id">
				<span className="image-id">
					{image.Id.replace("sha256:", "").substring(0, 12)}
				</span>
			</div>

			<div className="col-created">
				{new Date(image.Created * 1000).toLocaleDateString()}
			</div>

			<div className="col-size">
				<span className="image-size">{formatBytes(image.Size)}</span>
			</div>

			<div className="col-actions" onClick={e => e.stopPropagation()}>
				<div className="action-buttons">
					<button
						onClick={() => handleAction("run", image.Id)}
						className="action-btn run-btn"
						data-tooltip="Run container"
					>
						▶️
					</button>
					<button
						onClick={() => handleAction("create", image.Id)}
						className="action-btn create-btn"
						data-tooltip="Create container with custom settings"
					>
						⚙️
					</button>
					<button
						onClick={() => handleAction("remove", image.Id)}
						className="action-btn remove-btn"
						data-tooltip="Remove image"
					>
						🗑️
					</button>
				</div>
			</div>
		</div>
	)
}
