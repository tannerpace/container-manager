import { useContext } from "react"
import { DockerContext } from "../context/DockerContextDefinition"

export function useDocker() {
  const context = useContext(DockerContext)
  if (context === undefined) {
    throw new Error("useDocker must be used within a DockerProvider")
  }
  return context
}
