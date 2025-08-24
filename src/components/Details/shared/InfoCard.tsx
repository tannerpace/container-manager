import React from "react"

interface InfoCardProps {
	title: string
	children: React.ReactNode
	className?: string
}

/**
 * A reusable card for grouping related info rows in the details UI.
 */
export const InfoCard: React.FC<InfoCardProps> = ({ title, children, className }) => (
	<div className={`info-card${className ? ` ${className}` : ""}`}>
		<h4>{title}</h4>
		{children}
	</div>
)
