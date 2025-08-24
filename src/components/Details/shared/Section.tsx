import React from "react"

interface SectionProps {
	title: string
	children: React.ReactNode
	className?: string
}

/**
 * A reusable section for grouping cards or content in the details UI.
 */
export const Section: React.FC<SectionProps> = ({ title, children, className }) => (
	<div className={`tab-section${className ? ` ${className}` : ""}`}>
		<h3 className="section-title">{title}</h3>
		{children}
	</div>
)
