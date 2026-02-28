// Re-export all exam data and types
export * from './year3-saq'
export * from './year3-mcq'
export type { SAQQuestion, MCQQuestion, ExamInfo, ExamProgress } from '@/types/exam'

import { year3SAQExams, getSAQQuestions } from './year3-saq'
import { year3MCQExams, getMCQQuestions } from './year3-mcq'
import type { ExamInfo, SAQQuestion, MCQQuestion } from '@/types/exam'

// Get all exams for a given year
export function getExamsForYear(year: number): ExamInfo[] {
  // Currently only Year 3 exams are available
  if (year === 3) {
    return [...year3SAQExams, ...year3MCQExams]
  }
  return []
}

// Get exam info by ID
export function getExamInfo(examId: string): ExamInfo | undefined {
  const allExams = [...year3SAQExams, ...year3MCQExams]
  return allExams.find(exam => exam.id === examId)
}

// Get questions for any exam by ID
export function getExamQuestions(examId: string): SAQQuestion[] | MCQQuestion[] {
  if (examId.startsWith('saq-')) {
    return getSAQQuestions(examId)
  }
  if (examId.startsWith('mcq-')) {
    return getMCQQuestions(examId)
  }
  return []
}
