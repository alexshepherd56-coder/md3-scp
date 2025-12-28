import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

type NavigateOptions = {
  state?: unknown
  replace?: boolean
}

export function useViewTransitionNavigate() {
  const navigate = useNavigate()

  const navigateWithTransition = useCallback(
    (to: string, options?: NavigateOptions) => {
      // Check if View Transitions API is supported
      if (!document.startViewTransition) {
        navigate(to, options)
        return
      }

      document.startViewTransition(() => {
        navigate(to, options)
      })
    },
    [navigate]
  )

  return navigateWithTransition
}
