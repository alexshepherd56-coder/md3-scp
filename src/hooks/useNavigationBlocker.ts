import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Hook that provides a navigation function that checks for unsaved changes.
 * If user has unsaved changes and is not signed in, shows a prompt.
 * Otherwise, navigates normally.
 */
export function useNavigationBlocker() {
  const { user } = useAuth()
  const { hasUnsavedChanges, setShowSavePrompt, setPendingNavigation } = useUnsavedChanges()
  const navigate = useNavigate()

  const blockedNavigate = useCallback((to: string | number, options?: { replace?: boolean; state?: unknown }) => {
    // If user is signed in or no unsaved changes, navigate normally
    if (user || !hasUnsavedChanges) {
      if (typeof to === 'number') {
        navigate(to)
      } else {
        navigate(to, options)
      }
      return
    }

    // Store the pending navigation and show the prompt
    setPendingNavigation(() => {
      if (typeof to === 'number') {
        navigate(to)
      } else {
        navigate(to, options)
      }
    })
    setShowSavePrompt(true)
  }, [user, hasUnsavedChanges, navigate, setPendingNavigation, setShowSavePrompt])

  return { blockedNavigate, navigate }
}
