import { useParams, Navigate, useLocation } from 'react-router-dom'
import { Suspense, useRef } from 'react'
import { caseIndex, allCases, type CaseId } from '@/cases'
import { useProgress } from '@/contexts/ProgressContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useNavigationBlocker } from '@/hooks/useNavigationBlocker'
import { TextMarkupToolbar } from '@/components/TextMarkupToolbar'
import { Flag, AlertTriangle, Check } from 'lucide-react'

interface CasePageProps {
  year: string
}

export default function CasePage({ year }: CasePageProps) {
  const { caseId } = useParams<{ caseId: string }>()
  const { blockedNavigate } = useNavigationBlocker()
  const location = useLocation()
  const { isCompleted, isFlagged, toggleComplete, toggleFlag } = useProgress()
  const contentRef = useRef<HTMLDivElement>(null)

  if (!caseId || !(caseId in caseIndex)) {
    return <Navigate to="/" replace />
  }

  const CaseComponent = caseIndex[caseId as CaseId]
  const completed = isCompleted(caseId)
  const flagged = isFlagged(caseId)

  // Get case metadata from allCases array
  const caseData = allCases.find(c => c.id === caseId)
  const caseMetadata = caseData?.metadata
  const caseTitle = caseMetadata?.title?.split('|')[0]?.trim() || 'Untitled'

  // Determine back navigation - if came from weekly, go back there
  const getBackPath = () => {
    const referrer = location.state?.from
    if (referrer && referrer.includes('/weekly/')) {
      return referrer
    }
    return `/year${year}`
  }

  const getBackLabel = () => {
    const referrer = location.state?.from
    if (referrer && referrer.includes('/weekly/')) {
      return 'Back to Week'
    }
    return 'Back to Cases'
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1] dark:bg-[#1a1a1a]">
      {/* Container */}
      <div className="max-w-[1200px] mx-auto bg-white dark:bg-gray-900 min-h-screen border-x border-[#E8E3D9] dark:border-gray-800 px-10 py-6">

        {/* Case Header */}
        <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
          {/* Back Link */}
          <button
            onClick={() => blockedNavigate(getBackPath())}
            className="inline-flex items-center text-[#D97757] bg-transparent border-none font-medium text-[15px] transition-all duration-200 cursor-pointer py-1.5 px-3 -ml-3 rounded-lg hover:bg-[#FBF0ED] hover:-translate-x-0.5"
          >
            ← {getBackLabel()}
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Flag Button */}
            <div className="relative group">
              <button
                onClick={() => toggleFlag(caseId)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  flagged
                    ? 'bg-[#dc3545] text-white hover:bg-[#c82333]'
                    : 'bg-white dark:bg-gray-800 text-[#4B535A] dark:text-gray-400 hover:bg-[#FBF0ED] dark:hover:bg-gray-700 border border-[#E8E3D9] dark:border-gray-600'
                }`}
              >
                <Flag className={`w-5 h-5 ${flagged ? 'fill-current' : ''}`} />
              </button>
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {flagged ? 'Unflag case' : 'Flag case'}
              </span>
            </div>

            {/* Complete Button */}
            <div className="relative group">
              <button
                onClick={() => toggleComplete(caseId)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  completed
                    ? 'bg-[#4CAF50] text-white hover:bg-[#45a049]'
                    : 'bg-white dark:bg-gray-800 text-[#4B535A] dark:text-gray-400 hover:bg-[#FBF0ED] dark:hover:bg-gray-700 border border-[#E8E3D9] dark:border-gray-600'
                }`}
              >
                <Check className="w-5 h-5" />
              </button>
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {completed ? 'Mark incomplete' : 'Mark complete'}
              </span>
            </div>
          </div>
        </div>

        {/* Case Title */}
        <h1 className="font-[Georgia,'Times_New_Roman',serif] text-[32px] font-medium text-[#0A0A0A] dark:text-white m-0 mb-2 tracking-[-0.02em] leading-[1.2]">
          {caseId.replace(/^y4\./, '').replace('_', '.')} {caseTitle}
        </h1>

        {/* Divider */}
        <div className="mb-6 pb-4 border-b border-[#E8E3D9] dark:border-gray-700"></div>

        {/* Text Markup Toolbar */}
        <TextMarkupToolbar caseId={caseId} containerRef={contentRef} />

        {/* Case Content */}
        <div className="pb-24">
          <div ref={contentRef} className="prose prose-lg max-w-none dark:prose-invert
              prose-headings:font-[Georgia,'Times_New_Roman',serif] prose-headings:tracking-[-0.02em]
              prose-h1:hidden
              prose-h2:text-[18px] prose-h2:font-semibold prose-h2:text-[#0A0A0A] dark:prose-h2:text-white prose-h2:mb-2 prose-h2:mt-0 prose-h2:pb-0 prose-h2:border-b-0
              prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-[#0A0A0A] dark:prose-h3:text-white
              prose-h4:text-base prose-h4:font-semibold prose-h4:mt-5 prose-h4:mb-2 prose-h4:text-[#0A0A0A] dark:prose-h4:text-white
              prose-p:text-[#0A0A0A] dark:prose-p:text-gray-200 prose-p:leading-[1.7] prose-p:text-[15px] prose-p:my-3
              prose-strong:text-[#0A0A0A] dark:prose-strong:text-white prose-strong:font-semibold
              prose-ul:my-3 prose-ul:pl-5
              prose-ol:my-3 prose-ol:pl-5
              prose-li:my-1.5 prose-li:leading-[1.6]
              prose-blockquote:border-l-4 prose-blockquote:border-[#D97757] prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:my-4 prose-blockquote:bg-[#FBF0ED] dark:prose-blockquote:bg-gray-800 prose-blockquote:rounded-r-lg prose-blockquote:italic
              prose-table:my-4 prose-table:border-collapse prose-table:w-full
              prose-th:border prose-th:border-[#E8E3D9] dark:prose-th:border-gray-600 prose-th:px-3 prose-th:py-2 prose-th:bg-[#F9F6F1] dark:prose-th:bg-gray-800 prose-th:font-semibold prose-th:text-sm prose-th:text-left
              prose-td:border prose-td:border-[#E8E3D9] dark:prose-td:border-gray-600 prose-td:px-3 prose-td:py-2 prose-td:text-[14px]
              prose-code:bg-[#F5F5F5] dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-code:font-mono
              prose-pre:bg-[#1a1a1a] prose-pre:rounded-lg prose-pre:p-4 prose-pre:my-4
              select-text [&>h2:not(:first-of-type)]:mt-8">
            <ErrorBoundary
              fallback={
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-medium text-[#0A0A0A] dark:text-white mb-2">
                    Failed to load case
                  </h3>
                  <p className="text-[#4B535A] dark:text-gray-400 mb-4">
                    There was an error loading this case content.
                  </p>
                  <button
                    onClick={() => blockedNavigate('/')}
                    className="px-6 py-2.5 bg-[#D97757] text-white border-none rounded-lg font-medium cursor-pointer transition-all duration-200 hover:bg-[#C5654A]"
                  >
                    Back to Cases
                  </button>
                </div>
              }
            >
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="text-[#4B535A] dark:text-gray-400">Loading case...</div>
                  </div>
                }
              >
                <CaseComponent />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>

      </div>
    </div>
  )
}
