import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { Suspense, useEffect } from 'react'
import { caseIndex, allCases, type CaseId } from '@/cases'
import { useProgress } from '@/contexts/ProgressContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ArrowLeft, X, Flag, AlertTriangle } from 'lucide-react'

interface CasePageProps {
  year: string
}

export default function CasePage({ year }: CasePageProps) {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const { isCompleted, isFlagged, toggleComplete, toggleFlag } = useProgress()

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate(`/year${year}`)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [navigate, year])

  if (!caseId || !(caseId in caseIndex)) {
    return <Navigate to="/" replace />
  }

  const CaseComponent = caseIndex[caseId as CaseId]
  const completed = isCompleted(caseId)
  const flagged = isFlagged(caseId)

  // Get case metadata from allCases array
  const caseData = allCases.find(c => c.id === caseId)
  const caseMetadata = caseData?.metadata || {}
  const caseTitle = caseMetadata.title?.split('|')[0]?.trim() || 'Untitled'
  const caseSetting = caseMetadata.setting || ''

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] animate-[fadeIn_0.2s_ease]"
        onClick={() => navigate(`/year${year}`)}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[201] flex items-start justify-center overflow-y-auto pointer-events-none pt-4 pb-4">
        <div
          className="w-full max-w-[1300px] bg-white dark:bg-gray-800 shadow-[0_20px_60px_rgba(0,0,0,0.3)] pointer-events-auto animate-[modalSlideUp_0.3s_ease] min-h-[calc(100vh-2rem)] mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Back to Cases Link */}
          <div className="px-10 pt-8 pb-4">
            <button
              onClick={() => navigate(`/year${year}`)}
              className="inline-flex items-center gap-2 text-[#D97757] bg-transparent border-none font-normal text-[15px] transition-colors duration-200 cursor-pointer hover:text-[#C5654A]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cases
            </button>
          </div>

          {/* Case Header */}
          <div className="px-10 pb-6 border-b border-[#E8E3D9] dark:border-gray-700">
            <h1 className="font-[Georgia,'Times_New_Roman',serif] text-[42px] font-normal text-[#0A0A0A] dark:text-white m-0 mb-4 tracking-[-0.02em] leading-[1.2]">
              Case {caseId} – {caseTitle}
            </h1>
            <div className="text-[15px] text-[#0A0A0A] dark:text-white">
              <span className="font-semibold">Category:</span> {caseMetadata.category || 'N/A'} | <span className="font-semibold">Discipline:</span> {caseMetadata.discipline || 'N/A'} | <span className="font-semibold">Setting:</span> {caseSetting || 'N/A'}
            </div>
          </div>

          {/* Case Content */}
          <div className="px-10 py-8">
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-[Georgia,'Times_New_Roman',serif] prose-headings:tracking-[-0.02em] prose-h1:hidden prose-h2:text-[32px] prose-h2:font-normal prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b-2 prose-h2:border-[#D97757] prose-h2:first-of-type:mt-0 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-4 prose-p:text-[#0A0A0A] dark:prose-p:text-gray-200 prose-p:leading-[1.7] prose-p:text-base prose-strong:text-[#0A0A0A] dark:prose-strong:text-white prose-strong:font-semibold prose-ul:my-4 prose-li:my-1 select-text">
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
                      onClick={() => navigate('/')}
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

          {/* Floating Action Buttons */}
          <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-[202]">
            {/* Flag Button */}
            <button
              onClick={() => toggleFlag(caseId)}
              className={`group relative inline-flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 ${
                flagged
                  ? 'bg-[#dc3545] text-white hover:bg-[#c82333]'
                  : 'bg-white dark:bg-gray-800 text-[#4B535A] dark:text-gray-400 hover:bg-[#FBF0ED] dark:hover:bg-gray-700 border border-[#E8E3D9] dark:border-gray-600'
              }`}
              title={flagged ? 'Unflag' : 'Flag'}
            >
              <Flag className={`w-5 h-5 ${flagged ? 'fill-current' : ''}`} />
              <span className="absolute right-16 bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {flagged ? 'Unflag' : 'Flag'}
              </span>
            </button>

            {/* Complete Button */}
            <button
              onClick={() => toggleComplete(caseId)}
              className={`group relative inline-flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 ${
                completed
                  ? 'bg-[#4CAF50] text-white hover:bg-[#45a049]'
                  : 'bg-white dark:bg-gray-800 text-[#4B535A] dark:text-gray-400 hover:bg-[#FBF0ED] dark:hover:bg-gray-700 border border-[#E8E3D9] dark:border-gray-600'
              }`}
              title={completed ? 'Completed' : 'Mark as Complete'}
            >
              {completed ? (
                <span className="text-xl">✓</span>
              ) : (
                <span className="text-xl">○</span>
              )}
              <span className="absolute right-16 bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {completed ? 'Completed' : 'Mark Complete'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
