export interface CaseMetadata {
  id: string
  title: string
  category: string
  discipline: string
  setting: string
}

export interface CaseQuestion {
  number: number
  question: string
  answer: string
}

export interface Case extends CaseMetadata {
  caseDescription: string
  questions: CaseQuestion[]
}

export type CaseId = string
