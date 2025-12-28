import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type User, onAuthStateChanged } from 'firebase/auth'
import { auth, signIn as firebaseSignIn, signOut as firebaseSignOut, signUp as firebaseSignUp, signInWithGoogle as firebaseSignInWithGoogle, signInWithFacebook as firebaseSignInWithFacebook, setRememberMe } from '@/services/firebase/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: (rememberMe?: boolean) => Promise<void>
  signInWithFacebook: (rememberMe?: boolean) => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string, rememberMe?: boolean) => {
    if (rememberMe !== undefined) {
      await setRememberMe(rememberMe)
    }
    await firebaseSignIn(email, password)
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    await firebaseSignUp(email, password, displayName)
  }

  const signOut = async () => {
    await firebaseSignOut()
  }

  const signInWithGoogle = async (rememberMe?: boolean) => {
    if (rememberMe !== undefined) {
      await setRememberMe(rememberMe)
    }
    await firebaseSignInWithGoogle()
  }

  const signInWithFacebook = async (rememberMe?: boolean) => {
    if (rememberMe !== undefined) {
      await setRememberMe(rememberMe)
    }
    await firebaseSignInWithFacebook()
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
