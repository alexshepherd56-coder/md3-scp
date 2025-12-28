// SAQ Question type
export interface SAQQuestion {
  id: number
  text: string
  subQuestions: string[]
}

// MCQ Question type
export interface MCQQuestion {
  id: number
  text: string
  options: string[]
  correctAnswer?: number // Index of correct answer (0-3), undefined if not available
}

// Exam metadata
export interface ExamInfo {
  id: string
  year: number
  type: 'saq' | 'mcq'
  title: string
  questionCount: number
  hasAnswers?: boolean // For MCQ - whether correct answers are available
}

// User's exam progress (stored in localStorage/Firestore)
export interface ExamProgress {
  examId: string
  currentQuestionIndex: number
  answers: Record<number, string | number | null> // questionId -> answer (string for SAQ, number for MCQ)
  flagged: number[] // Array of flagged question IDs
  startTime?: number
  lastUpdated: string
}
