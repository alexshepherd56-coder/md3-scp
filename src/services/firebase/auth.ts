import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User,
} from 'firebase/auth'
import { auth } from './config'

const googleProvider = new GoogleAuthProvider()
const facebookProvider = new FacebookAuthProvider()

export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)

  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName })
  }

  return userCredential.user
}

export async function signIn(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function signInWithFacebook(): Promise<User> {
  const result = await signInWithPopup(auth, facebookProvider)
  return result.user
}

export async function setRememberMe(remember: boolean): Promise<void> {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
}

export { auth }
