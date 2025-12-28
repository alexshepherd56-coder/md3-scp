import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useUnsavedChanges } from './UnsavedChangesContext'
import {
  loadLONotes,
  saveLONotes as saveLONotesToFirestore,
  loadLOCompletions,
  saveLOCompletions as saveLOCompletionsToFirestore,
  loadLOFlags,
  saveLOFlags as saveLOFlagsToFirestore,
  type AllLONotes,
  type LONote,
  type LOCompletionData,
  type LOFlagData
} from '@/services/firebase/firestore'

interface LONotesContextType {
  notes: AllLONotes
  completions: LOCompletionData
  flags: LOFlagData
  getLONote: (loId: string) => LONote | undefined
  saveLONote: (loId: string, content: string, images: string[]) => void
  hasNotes: (loId: string) => boolean
  isCompleted: (loId: string) => boolean
  toggleComplete: (loId: string) => void
  getCompletedCount: (loIds: string[]) => number
  isFlagged: (loId: string) => boolean
  toggleFlag: (loId: string) => void
  getFlaggedCount: (loIds: string[]) => number
}

const LONotesContext = createContext<LONotesContextType | undefined>(undefined)

export function LONotesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { markAsModified } = useUnsavedChanges()
  const [notes, setNotes] = useState<AllLONotes>({})
  const [completions, setCompletions] = useState<LOCompletionData>({})
  const [flags, setFlags] = useState<LOFlagData>({})
  const saveNotesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveCompletionsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveFlagsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load from Firestore or localStorage based on auth status
  useEffect(() => {
    const loadData = async () => {
      try {
        if (user) {
          // Load from Firestore for authenticated users
          const [firestoreNotes, firestoreCompletions, firestoreFlags] = await Promise.all([
            loadLONotes(user.uid),
            loadLOCompletions(user.uid),
            loadLOFlags(user.uid)
          ])

          if (Object.keys(firestoreNotes).length > 0) {
            setNotes(firestoreNotes)
            localStorage.setItem('scp_lo_notes_v1', JSON.stringify(firestoreNotes))
          } else {
            // If Firestore is empty, try localStorage and migrate
            const localNotes = localStorage.getItem('scp_lo_notes_v1')
            if (localNotes) {
              const parsed = JSON.parse(localNotes)
              setNotes(parsed)
              await saveLONotesToFirestore(user.uid, parsed)
            }
          }

          if (Object.keys(firestoreCompletions).length > 0) {
            setCompletions(firestoreCompletions)
            localStorage.setItem('scp_lo_completions_v1', JSON.stringify(firestoreCompletions))
          } else {
            const localCompletions = localStorage.getItem('scp_lo_completions_v1')
            if (localCompletions) {
              const parsed = JSON.parse(localCompletions)
              setCompletions(parsed)
              await saveLOCompletionsToFirestore(user.uid, parsed)
            }
          }

          if (Object.keys(firestoreFlags).length > 0) {
            setFlags(firestoreFlags)
            localStorage.setItem('scp_lo_flags_v1', JSON.stringify(firestoreFlags))
          } else {
            const localFlags = localStorage.getItem('scp_lo_flags_v1')
            if (localFlags) {
              const parsed = JSON.parse(localFlags)
              setFlags(parsed)
              await saveLOFlagsToFirestore(user.uid, parsed)
            }
          }
        } else {
          // Load from localStorage for guests
          const storedNotes = localStorage.getItem('scp_lo_notes_v1')
          const storedCompletions = localStorage.getItem('scp_lo_completions_v1')
          const storedFlags = localStorage.getItem('scp_lo_flags_v1')
          if (storedNotes) {
            setNotes(JSON.parse(storedNotes))
          }
          if (storedCompletions) {
            setCompletions(JSON.parse(storedCompletions))
          }
          if (storedFlags) {
            setFlags(JSON.parse(storedFlags))
          }
        }
      } catch (error) {
        console.error('Error loading LO notes:', error)
        // Fallback to localStorage
        const storedNotes = localStorage.getItem('scp_lo_notes_v1')
        const storedCompletions = localStorage.getItem('scp_lo_completions_v1')
        const storedFlags = localStorage.getItem('scp_lo_flags_v1')
        if (storedNotes) {
          try {
            setNotes(JSON.parse(storedNotes))
          } catch (e) {
            console.error('Error parsing localStorage LO notes:', e)
          }
        }
        if (storedCompletions) {
          try {
            setCompletions(JSON.parse(storedCompletions))
          } catch (e) {
            console.error('Error parsing localStorage LO completions:', e)
          }
        }
        if (storedFlags) {
          try {
            setFlags(JSON.parse(storedFlags))
          } catch (e) {
            console.error('Error parsing localStorage LO flags:', e)
          }
        }
      }
    }
    loadData()
  }, [user])

  // Save notes to localStorage and Firestore (debounced)
  const saveNotes = useCallback((updated: AllLONotes) => {
    localStorage.setItem('scp_lo_notes_v1', JSON.stringify(updated))
    markAsModified()

    if (user) {
      if (saveNotesTimeoutRef.current) {
        clearTimeout(saveNotesTimeoutRef.current)
      }
      saveNotesTimeoutRef.current = setTimeout(() => {
        saveLONotesToFirestore(user.uid, updated).catch(console.error)
      }, 1000)
    }
  }, [user, markAsModified])

  // Save completions to localStorage and Firestore (debounced)
  const saveCompletions = useCallback((updated: LOCompletionData) => {
    localStorage.setItem('scp_lo_completions_v1', JSON.stringify(updated))
    markAsModified()

    if (user) {
      if (saveCompletionsTimeoutRef.current) {
        clearTimeout(saveCompletionsTimeoutRef.current)
      }
      saveCompletionsTimeoutRef.current = setTimeout(() => {
        saveLOCompletionsToFirestore(user.uid, updated).catch(console.error)
      }, 500)
    }
  }, [user, markAsModified])

  // Save flags to localStorage and Firestore (debounced)
  const saveFlags = useCallback((updated: LOFlagData) => {
    localStorage.setItem('scp_lo_flags_v1', JSON.stringify(updated))
    markAsModified()

    if (user) {
      if (saveFlagsTimeoutRef.current) {
        clearTimeout(saveFlagsTimeoutRef.current)
      }
      saveFlagsTimeoutRef.current = setTimeout(() => {
        saveLOFlagsToFirestore(user.uid, updated).catch(console.error)
      }, 500)
    }
  }, [user, markAsModified])

  // Get LO note
  const getLONote = useCallback((loId: string): LONote | undefined => {
    return notes[loId]
  }, [notes])

  // Save LO note
  const saveLONote = useCallback((loId: string, content: string, images: string[]) => {
    setNotes(prev => {
      const updated = {
        ...prev,
        [loId]: {
          content,
          images,
          updatedAt: Date.now()
        }
      }
      saveNotes(updated)
      return updated
    })
  }, [saveNotes])

  // Check if LO has notes
  const hasNotes = useCallback((loId: string): boolean => {
    const note = notes[loId]
    return !!(note?.content && note.content.trim() !== '' && note.content !== '<p></p>')
  }, [notes])

  // Check if LO is completed
  const isCompleted = useCallback((loId: string): boolean => {
    return completions[loId] === true
  }, [completions])

  // Toggle LO completion
  const toggleComplete = useCallback((loId: string) => {
    setCompletions(prev => {
      const updated = {
        ...prev,
        [loId]: !prev[loId]
      }
      saveCompletions(updated)
      return updated
    })
  }, [saveCompletions])

  // Get count of completed LOs from a list
  const getCompletedCount = useCallback((loIds: string[]): number => {
    return loIds.filter(id => completions[id] === true).length
  }, [completions])

  // Check if LO is flagged
  const isFlagged = useCallback((loId: string): boolean => {
    return flags[loId] === true
  }, [flags])

  // Toggle LO flag
  const toggleFlag = useCallback((loId: string) => {
    setFlags(prev => {
      const updated = {
        ...prev,
        [loId]: !prev[loId]
      }
      saveFlags(updated)
      return updated
    })
  }, [saveFlags])

  // Get count of flagged LOs from a list
  const getFlaggedCount = useCallback((loIds: string[]): number => {
    return loIds.filter(id => flags[id] === true).length
  }, [flags])

  const value = {
    notes,
    completions,
    flags,
    getLONote,
    saveLONote,
    hasNotes,
    isCompleted,
    toggleComplete,
    getCompletedCount,
    isFlagged,
    toggleFlag,
    getFlaggedCount
  }

  return (
    <LONotesContext.Provider value={value}>
      {children}
    </LONotesContext.Provider>
  )
}

export function useLONotes() {
  const context = useContext(LONotesContext)
  if (!context) {
    throw new Error('useLONotes must be used within LONotesProvider')
  }
  return context
}
