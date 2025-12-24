export interface CompletionData {
  [caseId: string]: boolean
}

export interface FlagData {
  [caseId: string]: boolean
}

export interface ProgressStats {
  totalCases: number
  completedCases: number
  flaggedCases: number
  completionPercentage: number
}
