import React from "react"

interface WhaleIconProps {
  size?: number | string
  className?: string
  alt?: string
}

/**
 * Custom Whale Icon Component
 * Uses the freewhaley.png icon instead of emoji
 */
export const WhaleIcon: React.FC<WhaleIconProps> = ({
  size = 24,
  className = "",
  alt = "Whale",
}) => {
  // Determine which size image to use based on requested size
  const getIconPath = (requestedSize: number | string): string => {
    const numSize =
      typeof requestedSize === "string"
        ? parseInt(requestedSize)
        : requestedSize

    if (numSize <= 16) return "/freewhaley-16.png"
    if (numSize <= 32) return "/freewhaley-32.png"
    if (numSize <= 48) return "/freewhaley-48.png"
    if (numSize <= 64) return "/freewhaley-64.png"
    if (numSize <= 128) return "/freewhaley-128.png"
    if (numSize <= 256) return "/freewhaley-256.png"
    return "/freewhaley.png" // Original 1024px for very large sizes
  }

  return (
    <img
      src={getIconPath(size)}
      alt={alt}
      width={size}
      height={size}
      className={`whale-icon ${className}`}
      style={{
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
        display: "inline-block",
        verticalAlign: "middle",
      }}
    />
  )
}
