import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface UnsavedChangesContextType {
  hasUnsavedChanges: boolean
  markAsModified: () => void
  clearModifications: () => void
  showSavePrompt: boolean
  setShowSavePrompt: (show: boolean) => void
  pendingNavigation: (() => void) | null
  setPendingNavigation: (fn: (() => void) | null) => void
  proceedWithNavigation: () => void
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined)

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)

  // Clear modifications when user signs in (data will be synced to Firestore)
  useEffect(() => {
    if (user) {
      setHasUnsavedChanges(false)
    }
  }, [user])

  // Mark that modifications have been made
  const markAsModified = useCallback(() => {
    if (!user) {
      setHasUnsavedChanges(true)
    }
  }, [user])

  // Clear modification tracking
  const clearModifications = useCallback(() => {
    setHasUnsavedChanges(false)
  }, [])

  // Proceed with pending navigation (user chose "Maybe Later")
  const proceedWithNavigation = useCallback(() => {
    setShowSavePrompt(false)
    if (pendingNavigation) {
      pendingNavigation()
      setPendingNavigation(null)
    }
  }, [pendingNavigation])

  // Handle beforeunload for browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !user) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, user])

  const value = {
    hasUnsavedChanges,
    markAsModified,
    clearModifications,
    showSavePrompt,
    setShowSavePrompt,
    pendingNavigation,
    setPendingNavigation,
    proceedWithNavigation
  }

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
    </UnsavedChangesContext.Provider>
  )
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext)
  if (!context) {
    throw new Error('useUnsavedChanges must be used within UnsavedChangesProvider')
  }
  return context
}
