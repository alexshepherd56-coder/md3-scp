import { useCallback, useEffect, useRef } from 'react'
import { X, Check, NotebookPen, Flag } from 'lucide-react'
import { TiptapEditor } from './TiptapEditor'
import { useLONotes } from '@/contexts/LONotesContext'
import type { LearningObjective } from '@/types/week'

interface LODrawerProps {
  lo: LearningObjective | null
  isOpen: boolean
  onClose: () => void
}

export function LODrawer({ lo, isOpen, onClose }: LODrawerProps) {
  const { getLONote, saveLONote, isCompleted, toggleComplete, hasNotes, isFlagged, toggleFlag } = useLONotes()
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const note = lo ? getLONote(lo.id) : undefined
  const completed = lo ? isCompleted(lo.id) : false
  const hasNote = lo ? hasNotes(lo.id) : false
  const flagged = lo ? isFlagged(lo.id) : false

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Add slight delay to avoid closing immediately when clicking LO item
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Auto-save on content change with debounce
  const handleChange = useCallback((html: string) => {
    if (!lo) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveLONote(lo.id, html, note?.images || [])
    }, 500)
  }, [lo, saveLONote, note?.images])

  // Handle completion toggle
  const handleToggleComplete = useCallback(() => {
    if (lo) {
      toggleComplete(lo.id)
    }
  }, [lo, toggleComplete])

  // Handle flag toggle
  const handleToggleFlag = useCallback(() => {
    if (lo) {
      toggleFlag(lo.id)
    }
  }, [lo, toggleFlag])

  if (!lo) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 dark:bg-black/50 z-[90] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-[600px] bg-white dark:bg-[#1a1a1a] shadow-2xl z-[100] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#1a1a1a] border-b border-[#E8E3D9] dark:border-gray-700 px-6 py-4 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {lo.group && (
                <div className="text-xs font-medium text-[#D97757] uppercase tracking-wide mb-1">
                  {lo.group}
                </div>
              )}
              <h2 className="text-lg font-semibold text-[#0A0A0A] dark:text-white leading-tight">
                Learning Objective {lo.id.replace('w1-lo-', '')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-[#4B535A] dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pb-32 overflow-y-auto h-[calc(100%-80px)]">
          {/* LO Text */}
          <div className="mb-6 p-4 bg-[#F9F6F1] dark:bg-gray-800/50 rounded-lg border border-[#E8E3D9] dark:border-gray-700">
            <p className="text-[15px] text-[#0A0A0A] dark:text-white leading-relaxed">
              {lo.text}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex flex-wrap gap-3">
            {/* Completion Toggle */}
            <button
              onClick={handleToggleComplete}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                completed
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-[#4B535A] dark:text-gray-400 border border-[#E8E3D9] dark:border-gray-700 hover:bg-[#FBF0ED] dark:hover:bg-gray-700'
              }`}
            >
              <Check className={`w-4 h-4 ${completed ? 'text-green-600 dark:text-green-400' : ''}`} />
              {completed ? 'Marked as Complete' : 'Mark as Complete'}
            </button>

            {/* Flag Toggle */}
            <button
              onClick={handleToggleFlag}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                flagged
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-[#4B535A] dark:text-gray-400 border border-[#E8E3D9] dark:border-gray-700 hover:bg-[#FBF0ED] dark:hover:bg-gray-700'
              }`}
            >
              <Flag className={`w-4 h-4 ${flagged ? 'fill-current text-red-600 dark:text-red-400' : ''}`} />
              {flagged ? 'Flagged for Review' : 'Flag for Review'}
            </button>
          </div>

          {/* Notes Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <NotebookPen className="w-4 h-4 text-[#D97757]" />
              <h3 className="text-sm font-semibold text-[#0A0A0A] dark:text-white uppercase tracking-wide">
                Your Notes
              </h3>
              {hasNote && (
                <span className="px-2 py-0.5 text-xs font-medium bg-[#FBF0ED] dark:bg-[#D97757]/20 text-[#D97757] rounded-full">
                  Saved
                </span>
              )}
            </div>

            <div className="text-xs text-[#4B535A] dark:text-gray-400 mb-2">
              Notes are autosaved. You can add images by dragging and dropping or pasting.
            </div>

            {/* Rich Text Editor */}
            <div className="lo-notes-editor border border-[#E8E3D9] dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
              <TiptapEditor
                content={note?.content || ''}
                onChange={handleChange}
                placeholder="Type your notes about this learning objective..."
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
