import { createContext } from "react"

export interface TerminalContextType {
  isTerminalModalOpen: boolean
  setTerminalModalOpen: (isOpen: boolean) => void
}

export const TerminalContext = createContext<TerminalContextType | undefined>(
  undefined
)
