import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './config'
import type { CompletionData, FlagData } from '@/types/progress'
import type { AllAnnotations } from '@/contexts/AnnotationsContext'
import type { CaseMarkups } from '@/contexts/TextMarkupContext'

// Types for exam progress
export interface ExamProgress {
  currentIndex: number
  answers: Record<number, string | number | null>
  flagged: number[]
  elapsedTime: number
  startTime?: string
  lastUpdated: string
}

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

// Flagged questions tracking
export async function loadFlaggedQuestions(userId: string): Promise<FlagData> {
  const docRef = doc(db, 'users', userId, 'questionFlags', 'flags')
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? (docSnap.data() as FlagData) : {}
}

export async function saveFlaggedQuestions(userId: string, data: FlagData): Promise<void> {
  const docRef = doc(db, 'users', userId, 'questionFlags', 'flags')
  await setDoc(docRef, data, { merge: true })
}

// Annotations tracking
export async function loadAnnotations(userId: string): Promise<AllAnnotations> {
  const docRef = doc(db, 'users', userId, 'annotations', 'data')
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? (docSnap.data() as AllAnnotations) : {}
}

export async function saveAnnotations(userId: string, data: AllAnnotations): Promise<void> {
  const docRef = doc(db, 'users', userId, 'annotations', 'data')
  await setDoc(docRef, data)
}

// Text markup tracking
export async function loadTextMarkups(userId: string): Promise<CaseMarkups> {
  const docRef = doc(db, 'users', userId, 'markups', 'data')
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? (docSnap.data() as CaseMarkups) : {}
}

export async function saveTextMarkups(userId: string, data: CaseMarkups): Promise<void> {
  const docRef = doc(db, 'users', userId, 'markups', 'data')
  await setDoc(docRef, data)
}

// Exam progress tracking
export async function loadExamProgress(userId: string, examId: string): Promise<ExamProgress | null> {
  const docRef = doc(db, 'users', userId, 'exams', examId)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? (docSnap.data() as ExamProgress) : null
}

export async function saveExamProgress(userId: string, examId: string, data: ExamProgress): Promise<void> {
  const docRef = doc(db, 'users', userId, 'exams', examId)
  await setDoc(docRef, data)
}

export async function loadAllExamProgress(_userId: string): Promise<Record<string, ExamProgress>> {
  // For now, we'll load individual exams as needed
  // This could be optimized with a collection query if needed
  return {}
}

// LO Notes types
export interface LONote {
  content: string // HTML content from rich text editor
  images: string[] // Base64 encoded images
  updatedAt: number
}

export interface AllLONotes {
  [loId: string]: LONote
}

// LO Notes tracking
export async function loadLONotes(userId: string): Promise<AllLONotes> {
  const docRef = doc(db, 'users', userId, 'loNotes', 'data')
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? (docSnap.data() as AllLONotes) : {}
}

export async function saveLONotes(userId: string, data: AllLONotes): Promise<void> {
  const docRef = doc(db, 'users', userId, 'loNotes', 'data')
  await setDoc(docRef, data)
}

// LO Completion tracking
export interface LOCompletionData {
  [loId: string]: boolean
}

export async function loadLOCompletions(userId: string): Promise<LOCompletionData> {
  const docRef = doc(db, 'users', userId, 'loProgress', 'completed')
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? (docSnap.data() as LOCompletionData) : {}
}

export async function saveLOCompletions(userId: string, data: LOCompletionData): Promise<void> {
  const docRef = doc(db, 'users', userId, 'loProgress', 'completed')
  await setDoc(docRef, data, { merge: true })
}

// LO Flags tracking
export interface LOFlagData {
  [loId: string]: boolean
}

export async function loadLOFlags(userId: string): Promise<LOFlagData> {
  const docRef = doc(db, 'users', userId, 'loProgress', 'flagged')
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? (docSnap.data() as LOFlagData) : {}
}

export async function saveLOFlags(userId: string, data: LOFlagData): Promise<void> {
  const docRef = doc(db, 'users', userId, 'loProgress', 'flagged')
  await setDoc(docRef, data, { merge: true })
}
