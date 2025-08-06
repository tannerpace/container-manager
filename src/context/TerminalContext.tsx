import type { ReactNode } from "react"
import React, { useState } from "react"
import { TerminalContext } from "./TerminalContextDefinition"

interface TerminalProviderProps {
  children: ReactNode
}

export const TerminalProvider: React.FC<TerminalProviderProps> = ({
  children,
}) => {
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState(false)

  const setTerminalModalOpen = (isOpen: boolean) => {
    setIsTerminalModalOpen(isOpen)
  }

  return (
    <TerminalContext.Provider
      value={{ isTerminalModalOpen, setTerminalModalOpen }}
    >
      {children}
    </TerminalContext.Provider>
  )
}
