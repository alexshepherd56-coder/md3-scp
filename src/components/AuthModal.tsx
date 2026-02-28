import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

type AuthMode = 'signin' | 'signup' | 'reset'

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle, signInWithFacebook } = useAuth()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Reset mode when modal opens with a different initial mode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setError('')
      setResetSent(false)
    }
  }, [isOpen, initialMode])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signin') {
        await signIn(email, password, rememberMe)
        onClose()
      } else if (mode === 'signup') {
        await signUp(email, password, name)
        onClose()
      } else if (mode === 'reset') {
        const { resetPassword } = await import('@/services/firebase/auth')
        await resetPassword(email)
        setResetSent(true)
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string }
      if (firebaseError.code === 'auth/invalid-email') {
        setError('Invalid email address')
      } else if (firebaseError.code === 'auth/user-not-found') {
        setError('No account found with this email')
      } else if (firebaseError.code === 'auth/wrong-password') {
        setError('Incorrect password')
      } else if (firebaseError.code === 'auth/email-already-in-use') {
        setError('Email already in use')
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters')
      } else if (firebaseError.code === 'auth/invalid-credential') {
        setError('Invalid email or password')
      } else {
        setError(firebaseError.message || 'An error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setError('')
    setResetSent(false)
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle(rememberMe)
      onClose()
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string }
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled')
      } else {
        setError(firebaseError.message || 'Failed to sign in with Google')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithFacebook(rememberMe)
      onClose()
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string }
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled')
      } else {
        setError(firebaseError.message || 'Failed to sign in with Facebook')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] overflow-hidden">
      <div className="flex h-screen">
        {/* Left side - Form */}
        <div className="flex flex-1 flex-col justify-center px-6 py-16 sm:px-8 lg:flex-none lg:w-1/2 lg:px-24 xl:px-32 bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="mx-auto w-full max-w-md lg:w-[400px]">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-[#4B535A] hover:text-[#0A0A0A] dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div>
              <h2 className="text-3xl font-[Georgia,'Times_New_Roman',serif] font-semibold tracking-tight text-[#0A0A0A] dark:text-white">
                {mode === 'signin' && 'Sign in to your account'}
                {mode === 'signup' && 'Free for 2 Months'}
                {mode === 'reset' && 'Reset your password'}
              </h2>
              {mode === 'signup' && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="text-sm text-green-700 dark:text-green-400 flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Then <strong className="text-green-800 dark:text-green-300">$9.99 for 12 months</strong></span>
                  </div>
                </div>
              )}
              <p className="mt-3 text-sm text-[#4B535A] dark:text-gray-400">
                {mode === 'signin' && (
                  <span className="flex items-center gap-2 flex-wrap">
                    Not a member?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#D97757] to-[#E8956F] text-white text-sm font-semibold rounded-full hover:from-[#C5654A] hover:to-[#D97757] transition-all shadow-sm hover:shadow-md hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start 2 Month Free Trial
                    </button>
                  </span>
                )}
                {mode === 'signup' && (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="font-semibold text-[#D97757] hover:text-[#C5654A]"
                    >
                      Sign in
                    </button>
                  </>
                )}
                {mode === 'reset' && (
                  <>
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="font-semibold text-[#D97757] hover:text-[#C5654A]"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>

            <div className="mt-12">
              {error && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {mode === 'reset' && resetSent ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm text-center">
                  Password reset email sent! Check your inbox.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-7">
                  {mode === 'signup' && (
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-[#0A0A0A] dark:text-white mb-2.5">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full rounded-lg border border-[#E8E3D9] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3.5 text-[#0A0A0A] dark:text-white placeholder:text-[#4B535A]/60 focus:outline-none focus:ring-2 focus:ring-[#D97757] focus:border-transparent transition-all"
                        placeholder="Your name"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#0A0A0A] dark:text-white mb-2.5">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border border-[#E8E3D9] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3.5 text-[#0A0A0A] dark:text-white placeholder:text-[#4B535A]/60 focus:outline-none focus:ring-2 focus:ring-[#D97757] focus:border-transparent transition-all"
                      placeholder="you@example.com"
                    />
                  </div>

                  {mode !== 'reset' && (
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-[#0A0A0A] dark:text-white mb-2.5">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full rounded-lg border border-[#E8E3D9] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3.5 text-[#0A0A0A] dark:text-white placeholder:text-[#4B535A]/60 focus:outline-none focus:ring-2 focus:ring-[#D97757] focus:border-transparent transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  )}

                  {mode === 'signin' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-[#D97757] focus:ring-[#D97757]"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-[#4B535A] dark:text-gray-400">
                          Remember me
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => switchMode('reset')}
                        className="text-sm font-semibold text-[#D97757] hover:text-[#C5654A]"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full justify-center rounded-lg bg-[#D97757] px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#C5654A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97757] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <>
                          {mode === 'signin' && 'Sign in'}
                          {mode === 'signup' && 'Start free trial'}
                          {mode === 'reset' && 'Send reset link'}
                        </>
                      )}
                    </button>
                    {mode === 'signup' && (
                      <p className="text-xs text-center text-[#4B535A] dark:text-gray-400 mt-4">
                        No card details required for trial
                      </p>
                    )}
                  </div>

                  {mode !== 'reset' && (
                    <>
                      <div className="relative mt-8">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-[#E8E3D9] dark:border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="bg-white dark:bg-gray-900 px-4 text-[#4B535A] dark:text-gray-400">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <div className="mt-8 grid grid-cols-2 gap-5">
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={loading}
                          className="flex items-center justify-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-3.5 text-sm font-semibold text-[#0A0A0A] dark:text-white shadow-sm ring-1 ring-inset ring-[#E8E3D9] dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-[#D97757] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          Google
                        </button>
                        <button
                          type="button"
                          onClick={handleFacebookSignIn}
                          disabled={loading}
                          className="flex items-center justify-center gap-2 rounded-lg bg-[#1877F2] px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#166FE5] focus-visible:ring-2 focus-visible:ring-[#1877F2] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#D97757] via-[#C5654A] to-[#A5503D]">
          <div className="flex flex-col items-center justify-center w-full">
            {/* Logo */}
            <svg
              className="w-32 h-32 text-white/90 mb-8"
              width="128"
              height="128"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <circle cx="20" cy="20" r="6" fill="currentColor"/>
                <path d="M20 4 Q20 12, 20 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <path d="M36 20 Q28 20, 28 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <path d="M20 36 Q20 28, 20 28" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <path d="M4 20 Q12 20, 12 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <path d="M29 11 Q24 16, 24 16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
                <path d="M29 29 Q24 24, 24 24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
                <path d="M11 29 Q16 24, 16 24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
                <path d="M11 11 Q16 16, 16 16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
              </g>
            </svg>

            {/* Brand name */}
            <h1 className="text-5xl font-[Georgia,'Times_New_Roman',serif] font-semibold text-white tracking-tight">
              NDhub
            </h1>
            <p className="mt-4 text-white/80 text-lg">
              Medical Case Studies
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
