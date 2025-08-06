import { createContext } from "react"
import type { DockerContextType } from "../types/dockerTypes"

export const DockerContext = createContext<DockerContextType | undefined>(undefined)
