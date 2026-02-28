import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useUnsavedChanges } from './UnsavedChangesContext'
import {
  loadCompletedCases,
  saveCompletedCases,
  loadFlaggedCases,
  saveFlaggedCases,
  loadFlaggedQuestions,
  saveFlaggedQuestions,
} from '@/services/firebase/firestore'
import type { CompletionData, FlagData } from '@/types/progress'

interface ProgressContextType {
  completedCases: CompletionData
  flaggedCases: FlagData
  flaggedQuestions: FlagData
  toggleComplete: (caseId: string) => void
  toggleFlag: (caseId: string) => void
  toggleQuestionFlag: (caseId: string, questionNumber: number) => void
  isCompleted: (caseId: string) => boolean
  isFlagged: (caseId: string) => boolean
  isQuestionFlagged: (caseId: string, questionNumber: number) => boolean
  getFlaggedQuestionCount: (caseId: string) => number
  getFlagTimestamp: (caseId: string) => number | null
  completionPercentage: number
  completedCount: number
  flaggedCount: number
  flaggedCaseCount: number
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { markAsModified } = useUnsavedChanges()
  const [completedCases, setCompletedCases] = useState<CompletionData>({})
  const [flaggedCases, setFlaggedCases] = useState<FlagData>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<FlagData>({})

  // Load from Firestore when user signs in
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          // Load completed cases
          const completed = await loadCompletedCases(user.uid)
          if (Object.keys(completed).length > 0) {
            setCompletedCases(completed)
            localStorage.setItem('scp_completedCases', JSON.stringify(completed))
          } else {
            // Migrate from localStorage
            const localCompleted = localStorage.getItem('scp_completedCases')
            if (localCompleted) {
              const parsed = JSON.parse(localCompleted)
              setCompletedCases(parsed)
              await saveCompletedCases(user.uid, parsed)
            }
          }

          // Load flagged cases
          const flagged = await loadFlaggedCases(user.uid)
          if (Object.keys(flagged).length > 0) {
            setFlaggedCases(flagged)
            localStorage.setItem('scp_flaggedCases', JSON.stringify(flagged))
          } else {
            // Migrate from localStorage
            const localFlagged = localStorage.getItem('scp_flaggedCases')
            if (localFlagged) {
              const parsed = JSON.parse(localFlagged)
              setFlaggedCases(parsed)
              await saveFlaggedCases(user.uid, parsed)
            }
          }

          // Load flagged questions
          const flaggedQs = await loadFlaggedQuestions(user.uid)
          if (Object.keys(flaggedQs).length > 0) {
            setFlaggedQuestions(flaggedQs)
            localStorage.setItem('scp_flaggedQuestions', JSON.stringify(flaggedQs))
          } else {
            // Migrate from localStorage
            const localFlaggedQs = localStorage.getItem('scp_flaggedQuestions')
            if (localFlaggedQs) {
              const parsed = JSON.parse(localFlaggedQs)
              setFlaggedQuestions(parsed)
              await saveFlaggedQuestions(user.uid, parsed)
            }
          }
        } catch (error) {
          console.error('Error loading data from Firestore:', error)
          // Fallback to localStorage
          const localCompleted = localStorage.getItem('scp_completedCases')
          const localFlagged = localStorage.getItem('scp_flaggedCases')
          const localFlaggedQs = localStorage.getItem('scp_flaggedQuestions')
          if (localCompleted) setCompletedCases(JSON.parse(localCompleted))
          if (localFlagged) setFlaggedCases(JSON.parse(localFlagged))
          if (localFlaggedQs) setFlaggedQuestions(JSON.parse(localFlaggedQs))
        }
      } else {
        // Load from localStorage for guests
        const localCompleted = localStorage.getItem('scp_completedCases')
        const localFlagged = localStorage.getItem('scp_flaggedCases')
        const localFlaggedQuestions = localStorage.getItem('scp_flaggedQuestions')

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

        if (localFlaggedQuestions) {
          try {
            setFlaggedQuestions(JSON.parse(localFlaggedQuestions))
          } catch (error) {
            console.error('Error parsing flagged questions from localStorage:', error)
          }
        }
      }
    }
    loadData()
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
      markAsModified()

      return updated
    })
  }

  const toggleFlag = (caseId: string) => {
    setFlaggedCases((prev) => {
      // If already flagged (truthy value), unflag it. Otherwise, set timestamp.
      const isCurrentlyFlagged = !!prev[caseId]
      const updated = {
        ...prev,
        [caseId]: isCurrentlyFlagged ? false : Date.now()
      }

      // Persist to Firestore or localStorage
      if (user) {
        saveFlaggedCases(user.uid, updated).catch(console.error)
      } else {
        localStorage.setItem('scp_flaggedCases', JSON.stringify(updated))
      }
      markAsModified()

      return updated
    })
  }

  const getFlagTimestamp = (caseId: string): number | null => {
    const value = flaggedCases[caseId]
    if (typeof value === 'number') return value
    if (value === true) return 0 // Legacy boolean value, no timestamp
    return null
  }

  const toggleQuestionFlag = (caseId: string, questionNumber: number) => {
    const key = `${caseId}-q${questionNumber}`
    setFlaggedQuestions((prev) => {
      const isCurrentlyFlagged = !!prev[key]
      const updated = {
        ...prev,
        [key]: isCurrentlyFlagged ? false : Date.now()
      }

      // Persist to Firestore or localStorage
      if (user) {
        saveFlaggedQuestions(user.uid, updated).catch(console.error)
      }
      localStorage.setItem('scp_flaggedQuestions', JSON.stringify(updated))
      markAsModified()
      return updated
    })
  }

  const isCompleted = (caseId: string) => !!completedCases[caseId]
  const isFlagged = (caseId: string) => !!flaggedCases[caseId]
  const isQuestionFlagged = (caseId: string, questionNumber: number) =>
    !!flaggedQuestions[`${caseId}-q${questionNumber}`]

  const getFlaggedQuestionCount = (caseId: string) => {
    return Object.entries(flaggedQuestions).filter(
      ([key, value]) => key.startsWith(`${caseId}-q`) && value
    ).length
  }

  const completedCount = Object.values(completedCases).filter(Boolean).length
  const flaggedCount = Object.values(flaggedCases).filter(Boolean).length
  const completionPercentage = (completedCount / 176) * 100

  const value = {
    completedCases,
    flaggedCases,
    flaggedQuestions,
    toggleComplete,
    toggleFlag,
    toggleQuestionFlag,
    isCompleted,
    isFlagged,
    isQuestionFlagged,
    getFlaggedQuestionCount,
    getFlagTimestamp,
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
