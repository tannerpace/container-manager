import React from "react"
import "./InspectSection.css"

interface InspectSectionProps {
	title: string
	data: unknown
	isRoot?: boolean
}

/**
 * Renders a section of the container inspect details, recursively formatting objects and arrays.
 */
export const InspectSection: React.FC<InspectSectionProps> = ({ title, data, isRoot = false }) => {
	if (!data || (typeof data === "object" && data !== null && Object.keys(data).length === 0)) {
		return null
	}

	const formatValue = (value: unknown): string => {
		if (value === null || value === undefined) return "null"
		if (typeof value === "boolean") return value.toString()
		if (typeof value === "string") return value || '""'
		if (typeof value === "number") return value.toString()
		if (Array.isArray(value)) return value.length === 0 ? "[]" : JSON.stringify(value, null, 2)
		if (typeof value === "object") return Object.keys(value).length === 0 ? "{}" : JSON.stringify(value, null, 2)
		return String(value)
	}

	return (
		<div className={`inspect-section${isRoot ? " root-section" : ""}`}>
			<h3 className="section-title">{title}</h3>
			<div className="section-content">
				{typeof data === "object" && !Array.isArray(data) && data !== null ? (
					Object.entries(data).map(([key, value]) => (
						<div key={key} className="field-row">
							<span className="field-key">{key}:</span>
							<div className="field-value">
								{typeof value === "object" && value !== null ? (
									<pre className="json-value">{formatValue(value)}</pre>
								) : (
									<span className={`scalar-value ${typeof value}`}>{formatValue(value)}</span>
								)}
							</div>
						</div>
					))
				) : (
					<pre className="json-value">{formatValue(data)}</pre>
				)}
			</div>
		</div>
	)
}
