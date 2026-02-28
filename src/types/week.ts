export interface WeekData {
  id: string
  weekNumber: number
  specialty: string
  displayName: string
  hasLearningObjectives: boolean
  loCount: number
  hasLoQuestions: boolean
  loQuestionCount: number
  cases: WeekCase[]
}

export interface WeekCase {
  id: string
  title: string
}

export interface LearningObjective {
  id: string
  weekId: string
  text: string
  group?: string
}
