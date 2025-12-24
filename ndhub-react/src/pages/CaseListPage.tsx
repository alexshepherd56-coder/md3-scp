import { Link } from 'react-router-dom'
import { allCases } from '@/cases'
import { useProgress } from '@/contexts/ProgressContext'
import { useSearch } from '@/contexts/SearchContext'

interface CaseListPageProps {
  year: string
  selectedGroup: string
  selectedSpecialty: string
}

export default function CaseListPage({ year, selectedGroup, selectedSpecialty }: CaseListPageProps) {
  const { isCompleted, isFlagged, completionPercentage } = useProgress()
  const { results, isSearching, query } = useSearch()

  // Filter cases by year first
  // Year 3: cases 1-9, Year 4: cases 10+
  const yearCases = allCases.filter(c => {
    const weekNum = parseInt(c.id.split('.')[0])
    if (year === '3') {
      return weekNum >= 1 && weekNum <= 9
    } else {
      return weekNum >= 10
    }
  })

  // Use search results if searching, otherwise filter based on selection
  const filteredCases = isSearching
    ? yearCases.filter(c => results.some(r => r.id === c.id))
    : yearCases.filter(caseModule => {
    const { id, metadata } = caseModule
    const discipline = metadata.discipline?.toLowerCase() || ''
    const category = metadata.category?.toLowerCase() || ''

    // Filter by flagged
    if (selectedGroup === 'flagged') {
      return isFlagged(id)
    }

    // Filter by group
    if (selectedGroup === 'medicine') {
      const isMedicine = discipline.includes('medicine') || discipline.includes('paediatrics') || discipline.includes('psychiatry')
      if (!isMedicine) return false
    } else if (selectedGroup === 'surgery') {
      if (!discipline.includes('surgery')) return false
    }

    // Filter by specialty
    if (selectedSpecialty) {
      switch (selectedSpecialty) {
        case 'cardiology': return discipline.includes('cardio')
        case 'psychiatry': return discipline.includes('psychiatry')
        case 'paediatrics': return discipline.includes('paediatrics')
        case 'neurology': return discipline.includes('neuro')
        case 'gastroenterology': return discipline.includes('gastro') || discipline.includes('git')
        case 'endocrinology': return discipline.includes('endocrin')
        case 'renal': return discipline.includes('renal') || discipline.includes('kidney')
        case 'respiratory': return discipline.includes('respiratory') || category.includes('respiratory')
        case 'rheumatology': return discipline.includes('rheum')
        case 'haematology': return discipline.includes('haem')
        case 'og': return discipline.includes('o&g') || discipline.includes('gynae') || discipline.includes('obstet')
        case 'git': return discipline.includes('git')
        case 'general': return discipline.includes('general surgery')
        case 'breast': return discipline.includes('breast') || discipline.includes('endocrine')
        case 'ortho': return discipline.includes('ortho')
        case 'vascular': return discipline.includes('vascular')
        default: return true
      }
    }

    return true
  })

  const getGroupTitle = () => {
    if (isSearching) {
      return `Search results for "${query}"`
    }
    if (selectedSpecialty) {
      const specialty = selectedSpecialty === 'og' ? 'O&G' :
                       selectedSpecialty === 'git' ? 'GIT' :
                       selectedSpecialty === 'breast' ? 'Breast & Endocrine' :
                       selectedSpecialty.charAt(0).toUpperCase() + selectedSpecialty.slice(1)
      return `${specialty} Cases`
    }
    if (selectedGroup === 'flagged') return 'Flagged Cases'
    if (selectedGroup === 'medicine') return 'Medicine Cases'
    if (selectedGroup === 'surgery') return 'Surgery Cases'
    return 'All Cases'
  }

  return (
    <div className="flex-1 px-10 py-6 pt-12 overflow-y-auto max-w-[1400px] mx-auto ml-[280px]">
      {/* Cases Section */}
      <div className="mb-14">
        <h2 className="font-[Georgia,'Times_New_Roman',serif] text-2xl my-14 mb-6 pt-8 text-[#0A0A0A] dark:text-white font-medium tracking-[-0.02em] border-t border-[#E8E3D9] dark:border-gray-700 first-of-type:border-t-0 first-of-type:pt-0 first-of-type:mt-0">
          {getGroupTitle()}
        </h2>

        {filteredCases.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#4B535A] dark:text-gray-400 text-lg">
              No cases found in this category
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-5 mb-8">
            {filteredCases.map((caseModule) => {
              const { id, metadata } = caseModule
              const completed = isCompleted(id)
              const flagged = isFlagged(id)

              const caseTitle = metadata.title?.split('|')[0]?.trim() || 'Untitled Case'
              const caseSetting = metadata.setting || ''

              return (
                <Link
                  key={id}
                  to={`/year${year}/cases/${id}`}
                  className={`
                    w-[320px] min-h-[100px]
                    bg-white dark:bg-gray-800
                    border border-[#E8E3D9] dark:border-gray-700
                    rounded-lg p-5
                    flex flex-col justify-center
                    cursor-pointer
                    transition-all duration-200
                    no-underline
                    relative
                    hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                    hover:border-[#D97757]
                    ${completed ? 'border-l-4 border-l-[#4CAF50]' : ''}
                  `}
                >
                  {/* Flag Bookmark Icon - Left side, red */}
                  {flagged && (
                    <div className="absolute top-0 left-3">
                      <svg className="w-5 h-7 text-[#dc3545]" viewBox="0 0 24 32" fill="currentColor">
                        <path d="M0 0h24v32l-12-8-12 8V0z"/>
                      </svg>
                    </div>
                  )}

                  {/* Completion Check */}
                  {completed && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#4CAF50] flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}

                  {/* Case Content */}
                  <div className={flagged ? 'pl-6' : ''}>
                    <h3 className="text-[15px] font-semibold m-0 text-[#0A0A0A] dark:text-white leading-[1.4] tracking-[-0.01em] mb-1 pr-8">
                      Case {id} – {caseTitle}
                    </h3>
                    <div className="text-[13px] text-[#4B535A] dark:text-gray-400">
                      {caseSetting}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
