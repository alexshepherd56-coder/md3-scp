import { useCallback, useRef } from 'react'
import { useAnnotations } from '@/contexts/AnnotationsContext'
import { TiptapEditor } from './TiptapEditor'

interface InlineNotesEditorProps {
  caseId: string
  questionNumber: number
}

export function InlineNotesEditor({ caseId, questionNumber }: InlineNotesEditorProps) {
  const { getQuestionNote, saveQuestionNote } = useAnnotations()
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const note = getQuestionNote(caseId, questionNumber)

  // Auto-save on content change with debounce
  const handleChange = useCallback((html: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveQuestionNote(caseId, questionNumber, html, note?.images || [])
    }, 500)
  }, [caseId, questionNumber, saveQuestionNote, note?.images])

  return (
    <TiptapEditor
      content={note?.content || ''}
      onChange={handleChange}
      placeholder="Type your notes here..."
    />
  )
}
