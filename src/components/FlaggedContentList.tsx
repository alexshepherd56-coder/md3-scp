import { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Flag, Check, ChevronDown, BookOpen, HelpCircle, ClipboardList } from 'lucide-react'
import { useProgress } from '@/contexts/ProgressContext'
import { allCases } from '@/cases'
import { year3Weeks, year4Weeks } from '@/data/weeks'
import { getExamsForYear, getExamInfo, getExamQuestions } from '@/data/exams'
import questionIndex from '@/data/questionIndex.json'
import type { FlagSortOption } from '@/types/progress'

interface FlaggedContentListProps {
  year: string
}

interface FlaggedItem {
  id: string
  displayId: string
  title: string
  type: 'scp' | 'scp-question' | 'exam-question'
  weekNumber: number
  specialty: string
  flaggedAt: number
  caseId?: string
  questionNumber?: number
  examId?: string
  examType?: 'saq' | 'mcq'
  questionText?: string
  examTitle?: string
}

interface ExamProgressData {
  flagged: number[]
  lastUpdated?: string
}

const sortOptions: { value: FlagSortOption; label: string }[] = [
  { value: 'date-newest', label: 'Date Flagged (Newest)' },
  { value: 'date-oldest', label: 'Date Flagged (Oldest)' },
  { value: 'week-asc', label: 'Curriculum Week (1-30)' },
  { value: 'week-desc', label: 'Curriculum Week (30-1)' },
]

const categoryOrder = ['scp', 'scp-question', 'exam-question'] as const

export default function FlaggedContentList({ year }: FlaggedContentListProps) {
  const { flaggedCases, flaggedQuestions, toggleFlag, toggleQuestionFlag, isCompleted, toggleComplete } = useProgress()
  const [sortByCategory, setSortByCategory] = useState<Record<string, FlagSortOption>>({
    'scp': 'date-newest',
    'scp-question': 'date-newest',
    'exam-question': 'date-newest',
  })
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [examProgressData, setExamProgressData] = useState<Record<string, ExamProgressData>>({})
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const location = useLocation()

  const weeks = year === '3' ? year3Weeks : year4Weeks
  const exams = useMemo(() => getExamsForYear(parseInt(year)), [year])

  // Load exam progress from localStorage
  useEffect(() => {
    const loadExamProgress = () => {
      const progressData: Record<string, ExamProgressData> = {}
      exams.forEach(exam => {
        const saved = localStorage.getItem(`exam-progress-${exam.id}`)
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (parsed.flagged && parsed.flagged.length > 0) {
              progressData[exam.id] = parsed
            }
          } catch (e) {
            console.error('Error parsing exam progress:', e)
          }
        }
      })
      setExamProgressData(progressData)
    }
    loadExamProgress()

    // Listen for storage changes
    const handleStorageChange = () => loadExamProgress()
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [exams])

  // Build list of all flagged items with metadata
  const flaggedItems = useMemo(() => {
    const items: FlaggedItem[] = []

    // Get flagged SCPs
    Object.entries(flaggedCases).forEach(([caseId, value]) => {
      if (!value) return // Not flagged

      // Check if it belongs to this year
      if (year === '3') {
        const weekNum = parseInt(caseId.split('.')[0])
        if (isNaN(weekNum) || weekNum < 1 || weekNum > 30) return

        // Find the case in allCases
        const caseModule = allCases.find(c => c.id === caseId)
        if (!caseModule) return

        const week = weeks.find(w => w.weekNumber === weekNum)
        const caseTitle = caseModule.metadata.title?.split('|')[0]?.trim() || ''

        items.push({
          id: caseId,
          displayId: caseId,
          title: caseTitle,
          type: 'scp',
          weekNumber: weekNum,
          specialty: week?.specialty || '',
          flaggedAt: typeof value === 'number' ? value : 0,
        })
      } else if (year === '4' && caseId.startsWith('y4.')) {
        // Year 4 case
        const match = caseId.match(/^y4\.(\d+)_/)
        if (!match) return
        const weekNum = parseInt(match[1])

        const week = weeks.find(w => w.weekNumber === weekNum)
        const caseData = week?.cases.find(c => c.id === caseId)

        items.push({
          id: caseId,
          displayId: caseId.replace('y4.', '').replace('_', '.'),
          title: caseData?.title || '',
          type: 'scp',
          weekNumber: weekNum,
          specialty: week?.specialty || '',
          flaggedAt: typeof value === 'number' ? value : 0,
        })
      }
    })

    // Get flagged SCP Questions
    Object.entries(flaggedQuestions).forEach(([key, value]) => {
      if (!value) return // Not flagged

      // Parse key format: caseId-qN
      const match = key.match(/^(.+)-q(\d+)$/)
      if (!match) return

      const [, caseId, qNum] = match
      const questionNumber = parseInt(qNum)

      // Get question text from index
      const scpQuestionText = (questionIndex as Record<string, string>)[key] || ''

      // Check if it belongs to this year
      if (year === '3') {
        const weekNum = parseInt(caseId.split('.')[0])
        if (isNaN(weekNum) || weekNum < 1 || weekNum > 30) return

        const caseModule = allCases.find(c => c.id === caseId)
        if (!caseModule) return

        const week = weeks.find(w => w.weekNumber === weekNum)
        const caseTitle = caseModule.metadata.title?.split('|')[0]?.trim() || ''

        items.push({
          id: key,
          displayId: `${caseId} Q${questionNumber}`,
          title: caseTitle,
          type: 'scp-question',
          weekNumber: weekNum,
          specialty: week?.specialty || '',
          flaggedAt: typeof value === 'number' ? value : 0,
          caseId,
          questionNumber,
          questionText: scpQuestionText,
        })
      } else if (year === '4' && caseId.startsWith('y4.')) {
        const weekMatch = caseId.match(/^y4\.(\d+)_/)
        if (!weekMatch) return
        const weekNum = parseInt(weekMatch[1])

        const week = weeks.find(w => w.weekNumber === weekNum)
        const caseData = week?.cases.find(c => c.id === caseId)

        items.push({
          id: key,
          displayId: `${caseId.replace('y4.', '').replace('_', '.')} Q${questionNumber}`,
          title: caseData?.title || '',
          type: 'scp-question',
          weekNumber: weekNum,
          specialty: week?.specialty || '',
          flaggedAt: typeof value === 'number' ? value : 0,
          caseId,
          questionNumber,
          questionText: scpQuestionText,
        })
      }
    })

    // Get flagged Exam Questions from exam progress
    Object.entries(examProgressData).forEach(([examId, progress]) => {
      const examInfo = getExamInfo(examId)
      if (!examInfo) return

      // Get all questions for this exam to look up question text
      const examQuestions = getExamQuestions(examId)

      progress.flagged.forEach(questionId => {
        const lastUpdated = progress.lastUpdated ? new Date(progress.lastUpdated).getTime() : 0

        // Find the question text
        const question = examQuestions.find(q => q.id === questionId)
        const questionText = question?.text || ''

        items.push({
          id: `exam-${examId}-q${questionId}`,
          displayId: `Q${questionId}`,
          title: questionText,
          type: 'exam-question',
          weekNumber: 0, // Exams don't have week numbers
          specialty: examInfo.type === 'saq' ? 'SAQ Exam' : 'MCQ Exam',
          flaggedAt: lastUpdated,
          examId,
          examType: examInfo.type,
          questionNumber: questionId,
          questionText,
          examTitle: examInfo.title,
        })
      })
    })

    return items
  }, [flaggedCases, flaggedQuestions, examProgressData, year, weeks])

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, FlaggedItem[]> = {
      'scp': [],
      'scp-question': [],
      'exam-question': [],
    }

    flaggedItems.forEach(item => {
      groups[item.type].push(item)
    })

    // Sort within each group based on per-category sort option
    Object.keys(groups).forEach(key => {
      const sortOption = sortByCategory[key] || 'date-newest'
      switch (sortOption) {
        case 'date-newest':
          groups[key].sort((a, b) => b.flaggedAt - a.flaggedAt)
          break
        case 'date-oldest':
          groups[key].sort((a, b) => a.flaggedAt - b.flaggedAt)
          break
        case 'week-asc':
          groups[key].sort((a, b) => a.weekNumber - b.weekNumber)
          break
        case 'week-desc':
          groups[key].sort((a, b) => b.weekNumber - a.weekNumber)
          break
      }
    })

    return groups
  }, [flaggedItems, sortByCategory])

  const formatRelativeTime = (timestamp: number) => {
    if (!timestamp) return ''
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    const months = Math.floor(diff / 2592000000)
    const years = Math.floor(diff / 31536000000)

    if (years > 0) return `flagged ${years} year${years > 1 ? 's' : ''} ago`
    if (months > 0) return `flagged ${months} month${months > 1 ? 's' : ''} ago`
    if (days > 0) return `flagged ${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `flagged ${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `flagged ${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'flagged just now'
  }

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'scp': return <BookOpen className="w-5 h-5" />
      case 'scp-question': return <HelpCircle className="w-5 h-5" />
      case 'exam-question': return <ClipboardList className="w-5 h-5" />
      default: return <BookOpen className="w-5 h-5" />
    }
  }

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'scp': return 'SCPs'
      case 'scp-question': return 'SCP Questions'
      case 'exam-question': return 'Exam Questions'
      default: return 'Other'
    }
  }

  const handleUnflag = (item: FlaggedItem) => {
    if (item.type === 'scp') {
      toggleFlag(item.id)
    } else if (item.type === 'scp-question' && item.caseId && item.questionNumber) {
      toggleQuestionFlag(item.caseId, item.questionNumber)
    } else if (item.type === 'exam-question' && item.examId && item.questionNumber) {
      // Update localStorage for exam progress
      const saved = localStorage.getItem(`exam-progress-${item.examId}`)
      if (saved) {
        try {
          const progress = JSON.parse(saved)
          progress.flagged = progress.flagged.filter((id: number) => id !== item.questionNumber)
          progress.lastUpdated = new Date().toISOString()
          localStorage.setItem(`exam-progress-${item.examId}`, JSON.stringify(progress))
          // Trigger re-render by updating state
          setExamProgressData(prev => {
            const updated = { ...prev }
            if (progress.flagged.length === 0) {
              delete updated[item.examId!]
            } else {
              updated[item.examId!] = progress
            }
            return updated
          })
        } catch (e) {
          console.error('Error updating exam progress:', e)
        }
      }
    }
  }

  const renderItem = (item: FlaggedItem) => {
    const completed = item.type === 'scp' ? isCompleted(item.id) : false
    const isExamQuestion = item.type === 'exam-question'
    const isSCPQuestion = item.type === 'scp-question'
    const hasExpandableContent = isExamQuestion || isSCPQuestion
    const isHovered = hoveredItem === item.id
    let linkTo = '#'
    if (item.type === 'scp') {
      linkTo = `/year${year}/cases/${item.id}`
    } else if (item.type === 'scp-question' && item.caseId) {
      linkTo = `/year${year}/cases/${item.caseId}`
    } else if (item.type === 'exam-question' && item.examId && item.examType) {
      linkTo = `/year${year}/exams/${item.examType}/${item.examId}`
    }

    return (
      <div
        key={item.id}
        className={`
          flex items-start gap-4 p-4 rounded-lg border transition-all duration-200
          ${completed
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }
          hover:shadow-md
        `}
        onMouseEnter={() => hasExpandableContent && setHoveredItem(item.id)}
        onMouseLeave={() => hasExpandableContent && setHoveredItem(null)}
      >
        {/* Content */}
        <Link
          to={linkTo}
          state={{ from: location.pathname }}
          className="flex-1 min-w-0 no-underline"
        >
          {isExamQuestion ? (
            // Exam question format: "2024 Summative SAQ: Q1 xxxxxxxxxx"
            <div className={`text-sm transition-all duration-200 ${isHovered ? '' : 'line-clamp-1'}`}>
              <span className="font-semibold text-gray-900 dark:text-white">
                {item.examTitle}:
              </span>
              {' '}
              <span className="italic text-gray-500 dark:text-gray-400">
                {item.displayId} {item.questionText}
              </span>
            </div>
          ) : isSCPQuestion ? (
            // SCP Question format: "1.1 Hypertension" (bold) + "Q1 question text..." (italic)
            <div className={`text-sm transition-all duration-200 ${isHovered ? '' : 'line-clamp-1'}`}>
              <span className="font-semibold text-gray-900 dark:text-white">
                {item.caseId?.startsWith('y4.') ? item.caseId.replace('y4.', '').replace('_', '.') : item.caseId} {item.title}
              </span>
              {' '}
              <span className="italic text-gray-500 dark:text-gray-400">
                Q{item.questionNumber} {item.questionText}
              </span>
            </div>
          ) : (
            // SCP format
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {item.displayId} {item.title}
            </div>
          )}
          <div className="text-xs text-red-500 dark:text-red-400 mt-1">
            {item.flaggedAt > 0 ? formatRelativeTime(item.flaggedAt) : 'flagged'}
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => handleUnflag(item)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 bg-red-500 text-white hover:bg-red-600"
            title="Unflag"
          >
            <Flag className="w-4 h-4 fill-current" />
          </button>
          {item.type === 'scp' && (
            <button
              onClick={() => toggleComplete(item.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                completed
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={completed ? 'Mark incomplete' : 'Mark complete'}
            >
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  const totalCount = flaggedItems.length

  if (totalCount === 0) {
    return (
      <div className="text-center py-16">
        <Flag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No flagged items</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          Flag cases or questions to review them later
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
        {categoryOrder.map(type => {
          const items = groupedItems[type]
          const count = items.length
          const currentSort = sortByCategory[type] || 'date-newest'

          return (
            <div key={type}>
              {/* Category Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-[#D97757]">
                    {getCategoryIcon(type)}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {getCategoryLabel(type)}
                  </span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    ({count})
                  </span>
                </div>

                {/* Per-category Sort Dropdown */}
                {count > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === type ? null : type)}
                      className="flex items-center gap-1.5 px-2.5 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                    >
                      <span>{sortOptions.find(o => o.value === currentSort)?.label.split(' ')[0]}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === type ? 'rotate-180' : ''}`} />
                    </button>

                    {openDropdown === type && (
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 overflow-hidden">
                        {sortOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortByCategory(prev => ({ ...prev, [type]: option.value }))
                              setOpenDropdown(null)
                            }}
                            className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                              currentSort === option.value
                                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Items */}
              {count > 0 ? (
                <div className="space-y-2">
                  {items.map(renderItem)}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                  No flagged {getCategoryLabel(type).toLowerCase()}
                </div>
              )}
            </div>
          )
        })}
    </div>
  )
}
