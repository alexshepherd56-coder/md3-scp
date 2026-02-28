import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Flag } from 'lucide-react'
import { getExamsForYear } from '@/data/exams'
import type { ExamInfo } from '@/types/exam'

interface ExamListPageProps {
  year: string
}

export default function ExamListPage({ year }: ExamListPageProps) {
  const exams = useMemo(() => getExamsForYear(parseInt(year)), [year])
  const [flaggedCounts, setFlaggedCounts] = useState<Record<string, number>>({})

  // Load flagged counts from localStorage
  useEffect(() => {
    const loadFlaggedCounts = () => {
      const counts: Record<string, number> = {}
      exams.forEach(exam => {
        const saved = localStorage.getItem(`exam-progress-${exam.id}`)
        if (saved) {
          try {
            const progress = JSON.parse(saved)
            if (progress.flagged && progress.flagged.length > 0) {
              counts[exam.id] = progress.flagged.length
            }
          } catch (e) {
            console.error('Error parsing exam progress:', e)
          }
        }
      })
      setFlaggedCounts(counts)
    }
    loadFlaggedCounts()

    // Listen for storage changes
    const handleStorageChange = () => loadFlaggedCounts()
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [exams])

  // Group exams by type
  const saqExams = exams.filter(e => e.type === 'saq')
  const mcqExams = exams.filter(e => e.type === 'mcq')

  return (
    <div className="pl-9 pr-10 py-6 pt-8">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-[#0A0A0A] dark:text-white font-[Georgia,'Times_New_Roman',serif] mb-2">
            Past Exams
          </h1>
          <p className="text-[#4B535A] dark:text-gray-400">
            Practice with previous years' SAQ and MCQ exams. Your progress is saved automatically.
          </p>
        </div>

        {/* SAQ Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-[#0A0A0A] dark:text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#E8F4FD] dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </span>
            Short Answer Questions (SAQ)
          </h2>
          <div className="grid gap-4">
            {saqExams.map(exam => (
              <ExamCard key={exam.id} exam={exam} year={year} flaggedCount={flaggedCounts[exam.id] || 0} />
            ))}
          </div>
        </div>

        {/* MCQ Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-[#0A0A0A] dark:text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#F0FDF4] dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Multiple Choice Questions (MCQ)
          </h2>
          <div className="grid gap-4">
            {mcqExams.map(exam => (
              <ExamCard key={exam.id} exam={exam} year={year} flaggedCount={flaggedCounts[exam.id] || 0} />
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-[#FBF0ED] dark:bg-orange-900/20 border border-[#D97757]/20 rounded-xl">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-[#D97757] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-[#0A0A0A] dark:text-white font-medium mb-1">About Past Exams</p>
              <p className="text-sm text-[#4B535A] dark:text-gray-400">
                These are practice exams based on previous years' summative assessments.
                For MCQ exams with answers available, you can review correct answers after completing the exam.
                Your progress is automatically saved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ExamCard({ exam, year, flaggedCount }: { exam: ExamInfo; year: string; flaggedCount: number }) {
  const examPath = exam.type === 'saq'
    ? `/year${year}/exams/saq/${exam.id}`
    : `/year${year}/exams/mcq/${exam.id}`

  return (
    <Link
      to={examPath}
      className="block p-5 bg-white dark:bg-gray-800 border border-[#E8E3D9] dark:border-gray-700 rounded-xl hover:border-[#D97757] hover:shadow-[0_4px_12px_rgba(217,119,87,0.15)] transition-all duration-200 group"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[#0A0A0A] dark:text-white group-hover:text-[#D97757] transition-colors">
            {exam.title}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-[#4B535A] dark:text-gray-400">
              {exam.questionCount} questions
            </p>
            {exam.type === 'mcq' && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                exam.hasAnswers
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {exam.hasAnswers ? 'Answers available' : 'Practice only'}
              </span>
            )}
            {flaggedCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <Flag className="w-3 h-3 fill-current" />
                {flaggedCount} flagged
              </span>
            )}
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#F9F6F1] dark:bg-gray-700 flex items-center justify-center group-hover:bg-[#D97757] group-hover:text-white transition-all">
          <svg className="w-5 h-5 text-[#4B535A] dark:text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
