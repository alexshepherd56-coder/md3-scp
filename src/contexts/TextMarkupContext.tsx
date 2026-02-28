import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useUnsavedChanges } from './UnsavedChangesContext'
import { loadTextMarkups, saveTextMarkups as saveMarkupsToFirestore } from '@/services/firebase/firestore'

// Types for text markups
export interface TextMarkup {
  id: string
  type: 'highlight' | 'underline'
  color?: string
  text: string
  startOffset: number
  endOffset: number
  parentSelector: string
}

export interface CaseMarkups {
  [caseId: string]: TextMarkup[]
}

interface TextMarkupContextType {
  markups: CaseMarkups
  addMarkup: (caseId: string, markup: Omit<TextMarkup, 'id'>) => void
  removeMarkup: (caseId: string, markupId: string) => void
  getMarkups: (caseId: string) => TextMarkup[]
  clearMarkups: (caseId: string) => void
}

const TextMarkupContext = createContext<TextMarkupContextType | undefined>(undefined)

const HIGHLIGHT_COLORS = {
  yellow: '#fff176',
  green: '#a5d6a7',
  blue: '#90caf9',
  pink: '#f48fb1',
  orange: '#ffcc80'
}

export { HIGHLIGHT_COLORS }

export function TextMarkupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { markAsModified } = useUnsavedChanges()
  const [markups, setMarkups] = useState<CaseMarkups>({})
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load from Firestore or localStorage based on auth status
  useEffect(() => {
    const loadData = async () => {
      try {
        if (user) {
          // Load from Firestore for authenticated users
          const firestoreData = await loadTextMarkups(user.uid)
          if (Object.keys(firestoreData).length > 0) {
            setMarkups(firestoreData)
            // Also sync to localStorage as backup
            localStorage.setItem('scp_textMarkups', JSON.stringify(firestoreData))
          } else {
            // If Firestore is empty, try localStorage and migrate
            const localData = localStorage.getItem('scp_textMarkups')
            if (localData) {
              const parsed = JSON.parse(localData)
              setMarkups(parsed)
              // Migrate localStorage data to Firestore
              await saveMarkupsToFirestore(user.uid, parsed)
            }
          }
        } else {
          // Load from localStorage for guests
          const stored = localStorage.getItem('scp_textMarkups')
          if (stored) {
            setMarkups(JSON.parse(stored))
          }
        }
      } catch (error) {
        console.error('Error loading text markups:', error)
        // Fallback to localStorage
        const stored = localStorage.getItem('scp_textMarkups')
        if (stored) {
          try {
            setMarkups(JSON.parse(stored))
          } catch (e) {
            console.error('Error parsing localStorage markups:', e)
          }
        }
      }
    }
    loadData()
  }, [user])

  // Save to localStorage and Firestore (debounced for Firestore)
  const saveMarkups = useCallback((updated: CaseMarkups) => {
    // Always save to localStorage immediately
    localStorage.setItem('scp_textMarkups', JSON.stringify(updated))
    markAsModified()

    // Debounce Firestore saves to avoid too many writes
    if (user) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveMarkupsToFirestore(user.uid, updated).catch(console.error)
      }, 1000) // Debounce by 1 second
    }
  }, [user, markAsModified])

  const addMarkup = useCallback((caseId: string, markup: Omit<TextMarkup, 'id'>) => {
    const id = `markup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newMarkup: TextMarkup = { ...markup, id }

    setMarkups(prev => {
      const caseMarkups = prev[caseId] || []
      const updated = {
        ...prev,
        [caseId]: [...caseMarkups, newMarkup]
      }
      saveMarkups(updated)
      return updated
    })
  }, [saveMarkups])

  const removeMarkup = useCallback((caseId: string, markupId: string) => {
    setMarkups(prev => {
      const caseMarkups = prev[caseId] || []
      const updated = {
        ...prev,
        [caseId]: caseMarkups.filter(m => m.id !== markupId)
      }
      saveMarkups(updated)
      return updated
    })
  }, [saveMarkups])

  const getMarkups = useCallback((caseId: string): TextMarkup[] => {
    return markups[caseId] || []
  }, [markups])

  const clearMarkups = useCallback((caseId: string) => {
    setMarkups(prev => {
      const updated = { ...prev, [caseId]: [] }
      saveMarkups(updated)
      return updated
    })
  }, [saveMarkups])

  const value = {
    markups,
    addMarkup,
    removeMarkup,
    getMarkups,
    clearMarkups
  }

  return (
    <TextMarkupContext.Provider value={value}>
      {children}
    </TextMarkupContext.Provider>
  )
}

export function useTextMarkup() {
  const context = useContext(TextMarkupContext)
  if (!context) {
    throw new Error('useTextMarkup must be used within TextMarkupProvider')
  }
  return context
}
