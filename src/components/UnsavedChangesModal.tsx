import { useState } from 'react'
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext'

interface UnsavedChangesModalProps {
  onSignIn: () => void
  onCreateAccount: () => void
}

export default function UnsavedChangesModal({ onSignIn, onCreateAccount }: UnsavedChangesModalProps) {
  const { showSavePrompt, setShowSavePrompt, proceedWithNavigation } = useUnsavedChanges()
  const [isExiting, setIsExiting] = useState(false)

  if (!showSavePrompt) return null

  const handleSignIn = () => {
    setShowSavePrompt(false)
    onSignIn()
  }

  const handleCreateAccount = () => {
    setShowSavePrompt(false)
    onCreateAccount()
  }

  const handleMaybeLater = () => {
    setIsExiting(true)
    setTimeout(() => {
      proceedWithNavigation()
      setIsExiting(false)
    }, 200)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowSavePrompt(false)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[1001] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-200 ${isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        {/* Header with icon */}
        <div className="bg-gradient-to-br from-[#D97757] to-[#C5654A] px-6 py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white font-[Georgia,'Times_New_Roman',serif]">
            Save Your Progress
          </h2>
          <p className="mt-2 text-white/90 text-sm">
            Sign in or create an account to save your changes
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[#4B535A] dark:text-gray-400 text-sm text-center mb-6">
            You've made changes that will be lost if you leave without signing in.
            Create a free account to keep your notes, highlights, and progress synced across all your devices.
          </p>

          {/* Benefits list */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-[#0A0A0A] dark:text-white">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Sync progress across all devices</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#0A0A0A] dark:text-white">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Never lose your notes and highlights</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#0A0A0A] dark:text-white">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Track your study progress</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCreateAccount}
              className="w-full py-3 px-4 bg-[#D97757] text-white font-semibold rounded-lg hover:bg-[#C5654A] transition-colors"
            >
              Create Free Account
            </button>
            <button
              onClick={handleSignIn}
              className="w-full py-3 px-4 bg-white dark:bg-[#2a2a2a] text-[#0A0A0A] dark:text-white font-semibold rounded-lg border border-[#E8E3D9] dark:border-[#444] hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={handleMaybeLater}
              className="w-full py-2 px-4 text-[#4B535A] dark:text-gray-400 text-sm hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
