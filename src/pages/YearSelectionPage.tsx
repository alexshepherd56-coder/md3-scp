import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { allCases } from '@/cases'

export default function YearSelectionPage() {
  // Count cases by year
  const year3Cases = allCases.filter(c => {
    const weekNum = parseInt(c.id.split('.')[0])
    return weekNum >= 1 && weekNum <= 9
  }).length

  const year4Cases = allCases.filter(c => {
    const weekNum = parseInt(c.id.split('.')[0])
    return weekNum >= 10
  }).length

  return (
    <div className="min-h-screen bg-[#F9F6F1] dark:bg-[#1a1a1a] flex items-center justify-center px-8">
      <div className="max-w-[800px] w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <svg
              className="w-16 h-16 transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] text-[#0A0A0A] dark:text-white"
              width="64"
              height="64"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <circle cx="20" cy="20" r="6" fill="currentColor"/>
                <path d="M20 4 Q20 12, 20 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <path d="M36 20 Q28 20, 28 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <path d="M20 36 Q20 28, 20 28" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <path d="M4 20 Q12 20, 12 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <path d="M29 11 Q24 16, 24 16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
                <path d="M29 29 Q24 24, 24 24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
                <path d="M11 29 Q16 24, 16 24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
                <path d="M11 11 Q16 16, 16 16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
              </g>
            </svg>
          </div>
          <h1 className="font-[Georgia,'Times_New_Roman',serif] text-[56px] font-normal text-[#0A0A0A] dark:text-white m-0 mb-4 tracking-[-0.02em] leading-[1.2]">
            NDhub
          </h1>
          <p className="text-xl text-[#4B535A] dark:text-gray-400 m-0">
            Select your year to get started
          </p>
        </div>

        {/* Year Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Year 3 */}
          <Link
            to="/year3"
            className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-[#E8E3D9] dark:border-gray-700 transition-all duration-300 hover:border-[#D97757] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(217,119,87,0.15)] no-underline"
          >
            <div className="flex items-start justify-between mb-4">
              <BookOpen className="w-8 h-8 text-[#D97757]" />
              <span className="text-sm font-medium px-3 py-1 bg-[#D97757] text-white rounded-full">
                Active
              </span>
            </div>
            <h2 className="font-[Georgia,'Times_New_Roman',serif] text-3xl font-medium text-[#0A0A0A] dark:text-white mb-2 tracking-[-0.02em]">
              Year 3
            </h2>
            <p className="text-[#4B535A] dark:text-gray-400 mb-4">
              MD3 SCP Cases
            </p>
            <div className="text-sm text-[#4B535A] dark:text-gray-400">
              {year3Cases} cases available
            </div>
          </Link>

          {/* Year 4 */}
          <Link
            to="/year4"
            className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-[#E8E3D9] dark:border-gray-700 transition-all duration-300 hover:border-[#D97757] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(217,119,87,0.15)] no-underline"
          >
            <div className="flex items-start justify-between mb-4">
              <BookOpen className="w-8 h-8 text-[#D97757]" />
              <span className="text-sm font-medium px-3 py-1 bg-[#D97757] text-white rounded-full">
                Active
              </span>
            </div>
            <h2 className="font-[Georgia,'Times_New_Roman',serif] text-3xl font-medium text-[#0A0A0A] dark:text-white mb-2 tracking-[-0.02em]">
              Year 4
            </h2>
            <p className="text-[#4B535A] dark:text-gray-400 mb-4">
              MD4 SCP Cases
            </p>
            <div className="text-sm text-[#4B535A] dark:text-gray-400">
              {year4Cases} cases available
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-xs text-[#4B535A] dark:text-gray-400 uppercase tracking-wide">
          powered by sheptech ©
        </div>
      </div>
    </div>
  )
}
