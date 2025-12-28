export interface CompletionData {
  [caseId: string]: boolean
}

// FlagData now stores timestamp (number) when flagged, or false/undefined when not flagged
export interface FlagData {
  [caseId: string]: number | boolean
}

export interface ProgressStats {
  totalCases: number
  completedCases: number
  flaggedCases: number
  completionPercentage: number
}

export type FlagSortOption =
  | 'date-newest'
  | 'date-oldest'
  | 'week-asc'
  | 'week-desc'
  | 'category'
