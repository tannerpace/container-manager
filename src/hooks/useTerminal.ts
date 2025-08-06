import { useContext } from 'react'
import type { TerminalContextType } from '../context/TerminalContextDefinition'
import { TerminalContext } from '../context/TerminalContextDefinition'

export const useTerminal = (): TerminalContextType => {
  const context = useContext(TerminalContext)
  if (context === undefined) {
    throw new Error('useTerminal must be used within a TerminalProvider')
  }
  return context
}
