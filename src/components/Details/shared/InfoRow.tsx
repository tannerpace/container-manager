import React from "react"

interface InfoRowProps {
	label: React.ReactNode
	value: React.ReactNode
	className?: string
}

/**
 * A reusable row for displaying a label and value in the details UI.
 */
export const InfoRow: React.FC<InfoRowProps> = ({ label, value, className }) => (
	<div className={`info-row${className ? ` ${className}` : ""}`}>
		<span className="info-label">{label}</span>
		<span className="info-value">{value}</span>
	</div>
)
