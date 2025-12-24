import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import {
  loadCompletedCases,
  saveCompletedCases,
  loadFlaggedCases,
  saveFlaggedCases,
} from '@/services/firebase/firestore'
import type { CompletionData, FlagData } from '@/types/progress'

interface ProgressContextType {
  completedCases: CompletionData
  flaggedCases: FlagData
  toggleComplete: (caseId: string) => void
  toggleFlag: (caseId: string) => void
  isCompleted: (caseId: string) => boolean
  isFlagged: (caseId: string) => boolean
  completionPercentage: number
  completedCount: number
  flaggedCount: number
  flaggedCaseCount: number
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [completedCases, setCompletedCases] = useState<CompletionData>({})
  const [flaggedCases, setFlaggedCases] = useState<FlagData>({})

  // Load from Firestore when user signs in
  useEffect(() => {
    if (user) {
      loadCompletedCases(user.uid).then(setCompletedCases).catch(console.error)
      loadFlaggedCases(user.uid).then(setFlaggedCases).catch(console.error)
    } else {
      // Load from localStorage for guests
      const localCompleted = localStorage.getItem('scp_completedCases')
      const localFlagged = localStorage.getItem('scp_flaggedCases')

      if (localCompleted) {
        try {
          setCompletedCases(JSON.parse(localCompleted))
        } catch (error) {
          console.error('Error parsing completed cases from localStorage:', error)
        }
      }

      if (localFlagged) {
        try {
          setFlaggedCases(JSON.parse(localFlagged))
        } catch (error) {
          console.error('Error parsing flagged cases from localStorage:', error)
        }
      }
    }
  }, [user])

  const toggleComplete = (caseId: string) => {
    setCompletedCases((prev) => {
      const updated = { ...prev, [caseId]: !prev[caseId] }

      // Persist to Firestore or localStorage
      if (user) {
        saveCompletedCases(user.uid, updated).catch(console.error)
      } else {
        localStorage.setItem('scp_completedCases', JSON.stringify(updated))
      }

      return updated
    })
  }

  const toggleFlag = (caseId: string) => {
    setFlaggedCases((prev) => {
      const updated = { ...prev, [caseId]: !prev[caseId] }

      // Persist to Firestore or localStorage
      if (user) {
        saveFlaggedCases(user.uid, updated).catch(console.error)
      } else {
        localStorage.setItem('scp_flaggedCases', JSON.stringify(updated))
      }

      return updated
    })
  }

  const isCompleted = (caseId: string) => !!completedCases[caseId]
  const isFlagged = (caseId: string) => !!flaggedCases[caseId]

  const completedCount = Object.values(completedCases).filter(Boolean).length
  const flaggedCount = Object.values(flaggedCases).filter(Boolean).length
  const completionPercentage = (completedCount / 176) * 100

  const value = {
    completedCases,
    flaggedCases,
    toggleComplete,
    toggleFlag,
    isCompleted,
    isFlagged,
    completionPercentage,
    completedCount,
    flaggedCount,
    flaggedCaseCount: flaggedCount,
  }

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider')
  }
  return context
}
