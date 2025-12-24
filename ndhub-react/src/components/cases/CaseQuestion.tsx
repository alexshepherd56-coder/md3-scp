import { useState, type ReactNode } from 'react'
import clsx from 'clsx'

interface CaseQuestionProps {
  number: number
  question: string
  children: ReactNode
}

export default function CaseQuestion({ number, question, children }: CaseQuestionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-7 p-6 bg-white dark:bg-gray-800 rounded-lg border border-[#E8E3D9] dark:border-gray-700 transition-all duration-200 relative">
      {/* Question Header with Flag */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <p className="text-[#0A0A0A] dark:text-white font-semibold text-[17px] leading-[1.5] m-0">
            {number}. {question}
          </p>
        </div>
        <button className="text-[#4B535A] dark:text-gray-400 text-sm hover:text-[#D97757] transition-colors flex items-center gap-1 flex-shrink-0">
          Flag 🚩
        </button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-2.5 border-none rounded-md cursor-pointer bg-[#C5654A] text-white text-sm font-medium transition-all duration-200 hover:bg-[#b85840]"
        aria-expanded={isOpen}
        aria-controls={`answer-${number}`}
      >
        {isOpen ? 'Hide Answer' : 'Show Answer'}
      </button>

      {/* Answer Content */}
      <div
        id={`answer-${number}`}
        className={clsx(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isOpen ? 'max-h-[5000px] opacity-100 mt-5' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-5 bg-[#F5E6E0] dark:bg-gray-900 rounded-md">
          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:text-[#0A0A0A] dark:prose-p:text-gray-200 prose-p:leading-[1.7] prose-p:text-[15px] prose-strong:text-[#0A0A0A] dark:prose-strong:text-white prose-strong:font-bold prose-strong:text-[11px] prose-strong:uppercase prose-strong:tracking-wider prose-ul:my-2 prose-li:my-0.5 prose-table:border-collapse prose-table:w-full prose-th:border prose-th:border-gray-300 prose-th:p-2 prose-th:bg-gray-100 prose-th:font-bold prose-th:text-xs prose-th:uppercase prose-td:border prose-td:border-gray-300 prose-td:p-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
