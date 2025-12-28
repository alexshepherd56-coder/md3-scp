import { useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import clsx from 'clsx'
import { Flag, Eye, EyeOff, StickyNote, ChevronDown } from 'lucide-react'
import { useProgress } from '@/contexts/ProgressContext'
import { useAnnotations } from '@/contexts/AnnotationsContext'
import { InlineNotesEditor } from '@/components/InlineNotesEditor'

interface CaseQuestionProps {
  number: number
  question: string
  children: ReactNode
}

export default function CaseQuestion({ number, question, children }: CaseQuestionProps) {
  const { caseId } = useParams<{ caseId: string }>()
  const { isQuestionFlagged, toggleQuestionFlag } = useProgress()
  const { hasNotes } = useAnnotations()
  const [showAnswer, setShowAnswer] = useState(false)
  const [showNotes, setShowNotes] = useState(true)
  const isFlagged = caseId ? isQuestionFlagged(caseId, number) : false
  const hasUserNotes = caseId ? hasNotes(caseId, number) : false

  return (
    <div className={clsx(
      "mt-4 border rounded-lg overflow-hidden transition-all duration-200",
      isFlagged
        ? "border-[#dc3545] bg-red-50 dark:bg-red-900/20"
        : "border-[#E8E3D9] dark:border-gray-700 bg-white dark:bg-gray-800/50"
    )}>
      {/* Question Header */}
      <div className="flex items-center">
        <div className="flex-1 px-4 py-3">
          <p className="text-[#0A0A0A] dark:text-white font-medium text-[15px] leading-[1.5] m-0">
            <span className="text-[#D97757] font-semibold mr-2">Q{number}.</span>
            {question}
          </p>
        </div>

        {/* Flag Button */}
        <button
          onClick={() => caseId && toggleQuestionFlag(caseId, number)}
          className={clsx(
            "mr-3 p-1.5 rounded-full transition-all duration-200",
            isFlagged
              ? "bg-[#dc3545] text-white hover:bg-[#c82333]"
              : "text-[#4B535A] dark:text-gray-400 hover:bg-[#FBF0ED] dark:hover:bg-gray-700 hover:text-[#dc3545]"
          )}
          title={isFlagged ? 'Unflag question' : 'Flag question'}
        >
          <Flag className={clsx("w-3.5 h-3.5", isFlagged && "fill-current")} />
        </button>
      </div>

      {/* Notes and Answer Section - Always visible */}
      <div id={`answer-${number}`} className="px-4 pb-3">
        {/* Notes Section */}
        <div className="mb-3">
          {/* Notes toggle - only show when there are notes */}
          {hasUserNotes && (
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-1.5 text-xs text-[#4B535A] dark:text-gray-400 hover:text-[#0A0A0A] dark:hover:text-white mb-1.5 transition-colors"
            >
              <StickyNote className="w-3 h-3" />
              <span>Notes</span>
              <ChevronDown className={clsx("w-3 h-3 transition-transform", !showNotes && "-rotate-90")} />
            </button>
          )}

          {/* Notes editor - show if no notes yet OR if showNotes is true */}
          <div className={clsx(
            "transition-all duration-200 overflow-hidden",
            (!hasUserNotes || showNotes) ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          )}>
            {caseId && (
              <InlineNotesEditor caseId={caseId} questionNumber={number} />
            )}
          </div>
        </div>

        {/* Show Answer Toggle */}
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className={clsx(
            "inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-medium text-xs border transition-all duration-200",
            showAnswer
              ? "border-[#4B535A] text-[#4B535A] dark:border-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              : "border-[#D97757] text-[#D97757] hover:bg-[#FBF0ED] dark:hover:bg-[#D97757]/10"
          )}
        >
          {showAnswer ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              Hide Answer
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              Show Answer
            </>
          )}
        </button>

        {/* Answer Content */}
        <div
          className={clsx(
            'transition-all duration-300 ease-in-out overflow-hidden',
            showAnswer ? 'max-h-[5000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          )}
        >
          <div className="prose prose-sm max-w-none dark:prose-invert
            prose-headings:font-semibold prose-headings:text-[#0A0A0A] dark:prose-headings:text-white
            prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-2
            prose-h4:text-xs prose-h4:mt-3 prose-h4:mb-2 prose-h4:uppercase prose-h4:tracking-wide prose-h4:text-[#4B535A] dark:prose-h4:text-gray-400
            prose-p:text-[#0A0A0A] dark:prose-p:text-gray-200 prose-p:leading-[1.6] prose-p:text-[14px] prose-p:my-2
            prose-strong:text-[#0A0A0A] dark:prose-strong:text-white prose-strong:font-semibold
            prose-ul:my-2 prose-ul:pl-4
            prose-ol:my-2 prose-ol:pl-4
            prose-li:my-1 prose-li:leading-[1.5]
            prose-blockquote:border-l-2 prose-blockquote:border-[#D97757] prose-blockquote:pl-3 prose-blockquote:py-0.5 prose-blockquote:my-3 prose-blockquote:text-[#4B535A] dark:prose-blockquote:text-gray-400 prose-blockquote:italic
            prose-table:border-collapse prose-table:w-full prose-table:my-4
            prose-th:border prose-th:border-[#E8E3D9] dark:prose-th:border-gray-600 prose-th:px-3 prose-th:py-2 prose-th:bg-[#F9F6F1] dark:prose-th:bg-gray-800 prose-th:font-semibold prose-th:text-xs prose-th:text-left
            prose-td:border prose-td:border-[#E8E3D9] dark:prose-td:border-gray-600 prose-td:px-3 prose-td:py-2 prose-td:text-xs
            prose-code:bg-[#F5F5F5] dark:prose-code:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[12px]
            prose-hr:my-4 prose-hr:border-[#E8E3D9] dark:prose-hr:border-gray-700
            [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
            [&>p+ul]:mt-2 [&>p+ol]:mt-2 [&>ul+p]:mt-3 [&>ol+p]:mt-3
            [&>table+p]:mt-4 [&>p+table]:mt-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
