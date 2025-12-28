import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useUnsavedChanges } from './UnsavedChangesContext'
import { loadAnnotations, saveAnnotations as saveAnnotationsToFirestore } from '@/services/firebase/firestore'

// Types for question notes (free-form notes at the top of expanded question)
export interface QuestionNote {
  content: string // HTML content from rich text editor
  images: string[] // Base64 encoded images
  updatedAt: number
}

// Types for inline annotations (comments on specific text, like MS Word)
export interface InlineAnnotation {
  id: string
  text: string // The annotated text
  comment: string // The annotation/comment content
  createdAt: number
  updatedAt: number
}

export interface QuestionData {
  note?: QuestionNote
  inlineAnnotations: InlineAnnotation[]
}

export interface AllAnnotations {
  [questionKey: string]: QuestionData // key format: "caseId_questionNumber"
}

interface AnnotationsContextType {
  annotations: AllAnnotations
  // Question notes (free-form notes section)
  getQuestionNote: (caseId: string, questionNumber: number) => QuestionNote | undefined
  saveQuestionNote: (caseId: string, questionNumber: number, content: string, images: string[]) => void
  // Inline annotations (comments on specific text)
  getInlineAnnotations: (caseId: string, questionNumber: number) => InlineAnnotation[]
  addInlineAnnotation: (caseId: string, questionNumber: number, text: string, comment: string) => string
  updateInlineAnnotation: (caseId: string, questionNumber: number, annotationId: string, comment: string) => void
  deleteInlineAnnotation: (caseId: string, questionNumber: number, annotationId: string) => void
  getAnnotationCount: (caseId: string, questionNumber: number) => number
  hasNotes: (caseId: string, questionNumber: number) => boolean
}

const AnnotationsContext = createContext<AnnotationsContextType | undefined>(undefined)

export function AnnotationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { markAsModified } = useUnsavedChanges()
  const [annotations, setAnnotations] = useState<AllAnnotations>({})
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Generate key for question
  const getQuestionKey = (caseId: string, questionNumber: number) => `${caseId}_q${questionNumber}`

  // Load from Firestore or localStorage based on auth status
  useEffect(() => {
    const loadData = async () => {
      try {
        if (user) {
          // Load from Firestore for authenticated users
          const firestoreData = await loadAnnotations(user.uid)
          if (Object.keys(firestoreData).length > 0) {
            setAnnotations(firestoreData)
            // Also sync to localStorage as backup
            localStorage.setItem('scp_annotations_v2', JSON.stringify(firestoreData))
          } else {
            // If Firestore is empty, try localStorage and migrate
            const localData = localStorage.getItem('scp_annotations_v2')
            if (localData) {
              const parsed = JSON.parse(localData)
              setAnnotations(parsed)
              // Migrate localStorage data to Firestore
              await saveAnnotationsToFirestore(user.uid, parsed)
            }
          }
        } else {
          // Load from localStorage for guests
          const stored = localStorage.getItem('scp_annotations_v2')
          if (stored) {
            setAnnotations(JSON.parse(stored))
          }
        }
      } catch (error) {
        console.error('Error loading annotations:', error)
        // Fallback to localStorage
        const stored = localStorage.getItem('scp_annotations_v2')
        if (stored) {
          try {
            setAnnotations(JSON.parse(stored))
          } catch (e) {
            console.error('Error parsing localStorage annotations:', e)
          }
        }
      }
    }
    loadData()
  }, [user])

  // Save to localStorage and Firestore (debounced for Firestore)
  const saveAnnotations = useCallback((updated: AllAnnotations) => {
    // Always save to localStorage immediately
    localStorage.setItem('scp_annotations_v2', JSON.stringify(updated))
    markAsModified()

    // Debounce Firestore saves to avoid too many writes
    if (user) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveAnnotationsToFirestore(user.uid, updated).catch(console.error)
      }, 1000) // Debounce by 1 second
    }
  }, [user, markAsModified])

  // Get question note
  const getQuestionNote = useCallback((caseId: string, questionNumber: number): QuestionNote | undefined => {
    const key = getQuestionKey(caseId, questionNumber)
    return annotations[key]?.note
  }, [annotations])

  // Save question note
  const saveQuestionNote = useCallback((caseId: string, questionNumber: number, content: string, images: string[]) => {
    const key = getQuestionKey(caseId, questionNumber)

    setAnnotations(prev => {
      const existing = prev[key] || { inlineAnnotations: [] }
      const updated = {
        ...prev,
        [key]: {
          ...existing,
          note: {
            content,
            images,
            updatedAt: Date.now()
          }
        }
      }
      saveAnnotations(updated)
      return updated
    })
  }, [saveAnnotations])

  // Get inline annotations
  const getInlineAnnotations = useCallback((caseId: string, questionNumber: number): InlineAnnotation[] => {
    const key = getQuestionKey(caseId, questionNumber)
    return annotations[key]?.inlineAnnotations || []
  }, [annotations])

  // Add inline annotation
  const addInlineAnnotation = useCallback((caseId: string, questionNumber: number, text: string, comment: string): string => {
    const key = getQuestionKey(caseId, questionNumber)
    const id = `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Date.now()

    const newAnnotation: InlineAnnotation = {
      id,
      text,
      comment,
      createdAt: now,
      updatedAt: now
    }

    setAnnotations(prev => {
      const existing = prev[key] || { inlineAnnotations: [] }
      const updated = {
        ...prev,
        [key]: {
          ...existing,
          inlineAnnotations: [...existing.inlineAnnotations, newAnnotation]
        }
      }
      saveAnnotations(updated)
      return updated
    })

    return id
  }, [saveAnnotations])

  // Update inline annotation
  const updateInlineAnnotation = useCallback((caseId: string, questionNumber: number, annotationId: string, comment: string) => {
    const key = getQuestionKey(caseId, questionNumber)

    setAnnotations(prev => {
      const existing = prev[key]
      if (!existing) return prev

      const updated = {
        ...prev,
        [key]: {
          ...existing,
          inlineAnnotations: existing.inlineAnnotations.map(a =>
            a.id === annotationId
              ? { ...a, comment, updatedAt: Date.now() }
              : a
          )
        }
      }
      saveAnnotations(updated)
      return updated
    })
  }, [saveAnnotations])

  // Delete inline annotation
  const deleteInlineAnnotation = useCallback((caseId: string, questionNumber: number, annotationId: string) => {
    const key = getQuestionKey(caseId, questionNumber)

    setAnnotations(prev => {
      const existing = prev[key]
      if (!existing) return prev

      const updated = {
        ...prev,
        [key]: {
          ...existing,
          inlineAnnotations: existing.inlineAnnotations.filter(a => a.id !== annotationId)
        }
      }
      saveAnnotations(updated)
      return updated
    })
  }, [saveAnnotations])

  // Get total annotation count (notes + inline)
  const getAnnotationCount = useCallback((caseId: string, questionNumber: number): number => {
    const key = getQuestionKey(caseId, questionNumber)
    const data = annotations[key]
    if (!data) return 0

    let count = data.inlineAnnotations?.length || 0
    if (data.note?.content && data.note.content.trim() !== '') count++
    return count
  }, [annotations])

  // Check if question has any notes
  const hasNotes = useCallback((caseId: string, questionNumber: number): boolean => {
    const key = getQuestionKey(caseId, questionNumber)
    const data = annotations[key]
    if (!data) return false

    const hasNote = data.note?.content && data.note.content.trim() !== ''
    const hasInline = data.inlineAnnotations && data.inlineAnnotations.length > 0
    return hasNote || hasInline
  }, [annotations])

  const value = {
    annotations,
    getQuestionNote,
    saveQuestionNote,
    getInlineAnnotations,
    addInlineAnnotation,
    updateInlineAnnotation,
    deleteInlineAnnotation,
    getAnnotationCount,
    hasNotes
  }

  return (
    <AnnotationsContext.Provider value={value}>
      {children}
    </AnnotationsContext.Provider>
  )
}

export function useAnnotations() {
  const context = useContext(AnnotationsContext)
  if (!context) {
    throw new Error('useAnnotations must be used within AnnotationsProvider')
  }
  return context
}
