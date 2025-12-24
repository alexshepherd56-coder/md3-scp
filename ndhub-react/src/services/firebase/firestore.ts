import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './config'
import type { CompletionData, FlagData } from '@/types/progress'

// Completion tracking
export async function loadCompletedCases(userId: string): Promise<CompletionData> {
  const docRef = doc(db, 'users', userId, 'progress', 'completed')
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? (docSnap.data() as CompletionData) : {}
}

export async function saveCompletedCases(
  userId: string,
  data: CompletionData
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'progress', 'completed')
  await setDoc(docRef, data, { merge: true })
}

export async function toggleCaseCompletion(
  userId: string,
  caseId: string,
  completed: boolean
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'progress', 'completed')
  await updateDoc(docRef, { [caseId]: completed })
}

// Flag tracking
export async function loadFlaggedCases(userId: string): Promise<FlagData> {
  const docRef = doc(db, 'users', userId, 'caseFlags', 'flags')
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? (docSnap.data() as FlagData) : {}
}

export async function saveFlaggedCases(userId: string, data: FlagData): Promise<void> {
  const docRef = doc(db, 'users', userId, 'caseFlags', 'flags')
  await setDoc(docRef, data, { merge: true })
}

export async function toggleCaseFlag(
  userId: string,
  caseId: string,
  flagged: boolean
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'caseFlags', 'flags')
  await updateDoc(docRef, { [caseId]: flagged })
}
