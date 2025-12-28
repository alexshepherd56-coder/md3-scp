import { Link, useLocation } from 'react-router-dom'
import { allCases } from '@/cases'
import { useProgress } from '@/contexts/ProgressContext'
import { useSearch } from '@/contexts/SearchContext'
import { year3Weeks, year4Weeks } from '@/data/weeks'
import { Flag, Check } from 'lucide-react'
import FlaggedContentList from '@/components/FlaggedContentList'

interface CaseListPageProps {
  year: string
  selectedGroup: string
  selectedSpecialty: string
}

// Interface for Year 4 cases derived from weeks data
interface Year4Case {
  id: string
  title: string
  weekNumber: number
  specialty: string
}

export default function CaseListPage({ year, selectedGroup, selectedSpecialty }: CaseListPageProps) {
  const { isCompleted, isFlagged, toggleComplete, toggleFlag, getFlaggedQuestionCount } = useProgress()
  const { results, isSearching, query } = useSearch()
  const location = useLocation()

  // For Year 4, derive cases from weeks data
  const year4CasesFromWeeks: Year4Case[] = year4Weeks.flatMap(week =>
    week.cases.map(c => ({
      id: c.id,
      title: c.title,
      weekNumber: week.weekNumber,
      specialty: week.specialty
    }))
  )

  // Filter cases by year
  // Year 3: cases 1-30 from MDX files
  // Year 4: cases from weeks data
  const yearCases = year === '3'
    ? allCases.filter(c => {
        const weekNum = parseInt(c.id.split('.')[0])
        return weekNum >= 1 && weekNum <= 30
      })
    : []

  // Use search results if searching, otherwise filter based on selection
  const filteredCases = isSearching
    ? yearCases.filter(c => results.some(r => r.id === c.id))
    : yearCases.filter(caseModule => {
    const { id, metadata } = caseModule
    const discipline = metadata.discipline?.toLowerCase() || ''

    // Get week number from case ID to help with specialty filtering
    const weekNum = parseInt(id.split('.')[0])

    // Filter by flagged
    if (selectedGroup === 'flagged') {
      return isFlagged(id)
    }

    // Filter by group (Medicine vs Surgery)
    if (selectedGroup === 'medicine') {
      // Medicine includes: medicine, paediatrics medicine, psychiatry, neurology, gastroenterology,
      // general practice (cardiology), endocrinology, nephrology, respiratory, rheumatology, haematology, O&G
      const isMedicine = discipline.includes('medicine') ||
                         discipline.includes('paediatrics') ||
                         discipline.includes('psychiatry') ||
                         discipline.includes('neurology') ||
                         discipline.includes('gastroenterology') ||
                         discipline.includes('general practice') ||
                         discipline.includes('obstetrics') ||
                         discipline.includes('gynaecology')
      // Exclude if it's clearly surgery
      const isSurgery = discipline.includes('surgery')
      if (isSurgery && !discipline.includes('paediatrics')) return false
      if (!isMedicine && !isSurgery) return true // Include things like neurology that don't explicitly say medicine
    } else if (selectedGroup === 'surgery') {
      if (!discipline.includes('surgery')) return false
    }

    // Filter by specialty using week numbers as the source of truth
    if (selectedSpecialty) {
      switch (selectedSpecialty) {
        case 'cardiology':
          return weekNum === 1 || weekNum === 2 // Weeks 1-2 are Cardiology
        case 'psychiatry':
          return weekNum === 5 || weekNum === 15 || weekNum === 25 // Psychiatry weeks
        case 'paediatrics':
          return weekNum === 6 || weekNum === 9 || weekNum === 12 || weekNum === 16 ||
                 weekNum === 20 || weekNum === 23 || weekNum === 28 // Paediatrics weeks
        case 'neurology':
          return weekNum === 22 // Week 22 is Neurology
        case 'gastroenterology':
          return weekNum === 21 // Week 21 is Gastroenterology
        case 'endocrinology':
          return weekNum === 17 // Week 17 is Endocrinology
        case 'renal':
          return weekNum === 14 // Week 14 is Renal
        case 'respiratory':
          return weekNum === 7 || weekNum === 10 // Weeks 7, 10 are Respiratory
        case 'rheumatology':
          return weekNum === 26 // Week 26 is Rheumatology
        case 'haematology':
          return weekNum === 30 // Week 30 is Haematology
        case 'og':
          return weekNum === 4 || weekNum === 13 || weekNum === 18 ||
                 weekNum === 24 || weekNum === 29 // O&G weeks
        case 'git':
          return weekNum === 8 // Week 8 is GIT Surgery
        case 'general':
          return weekNum === 3 || weekNum === 11 // Weeks 3, 11 are General Surgery
        case 'breast':
          return weekNum === 11 // Week 11 is General Surgery & Breast
        case 'ortho':
          return weekNum === 19 // Week 19 is Ortho Surgery
        case 'vascular':
          return weekNum === 27 // Week 27 is Vascular Surgery
        default: return true
      }
    }

    return true
  })

  // Filter Year 4 cases
  const filteredYear4Cases = year4CasesFromWeeks.filter(caseItem => {
    const specialty = caseItem.specialty.toLowerCase()

    // Filter by flagged (using y4- prefix for Year 4 case IDs)
    if (selectedGroup === 'flagged') {
      return isFlagged(`y4-${caseItem.id}`)
    }

    // Filter by group
    if (selectedGroup === 'medicine') {
      return specialty.includes('anaesthe') || specialty.includes('medicine') ||
             specialty.includes('intensive care') || specialty.includes('emergency') ||
             specialty.includes('paediatrics') || specialty.includes('psychiatry') ||
             specialty.includes('endocrinology') || specialty.includes('hepatology') ||
             specialty.includes('dermatology') || specialty.includes('ophthalmology')
    } else if (selectedGroup === 'surgery') {
      return specialty.includes('surgery') || specialty.includes('orthopaedics') ||
             specialty.includes('neurosurgery') || specialty.includes('ent') ||
             specialty.includes('plastic')
    }

    // Filter by specialty
    if (selectedSpecialty) {
      switch (selectedSpecialty) {
        case 'anaesthesia': return specialty.includes('anaesthe')
        case 'medicine': return specialty.includes('medicine') && !specialty.includes('emergency')
        case 'surgery-general': return specialty.includes('surgery') && !specialty.includes('plastic') && !specialty.includes('neuro') && !specialty.includes('ent')
        default: return true
      }
    }

    return true
  })

  // Group Year 4 cases by week
  const year4CasesByWeek = year4Weeks
    .filter(week => week.cases.length > 0)
    .filter(week => {
      // Only show weeks that have cases matching the filter
      const weekCases = filteredYear4Cases.filter(c => c.weekNumber === week.weekNumber)
      return weekCases.length > 0
    })

  const getGroupTitle = () => {
    if (isSearching) {
      return `Search results for "${query}"`
    }
    if (selectedSpecialty) {
      const specialtyNames: Record<string, string> = {
        'og': 'O&G',
        'git': 'GIT',
        'breast': 'Breast & Endocrine',
        'anaesthesia': 'Anaesthesia',
        'medicine': 'Medicine',
        'surgery-general': 'General Surgery',
      }
      const specialty = specialtyNames[selectedSpecialty] ||
                       selectedSpecialty.charAt(0).toUpperCase() + selectedSpecialty.slice(1)
      return `${specialty} Cases`
    }
    if (selectedGroup === 'flagged') return 'Flagged Cases'
    if (selectedGroup === 'medicine') return 'Medicine Cases'
    if (selectedGroup === 'surgery') return 'Surgery Cases'
    return 'All Cases'
  }

  // Helper function to render a single case card
  const renderCaseCard = (caseModule: typeof allCases[0], yearNum: string) => {
    const { id, metadata } = caseModule
    const completed = isCompleted(id)
    const flagged = isFlagged(id)
    const flaggedQuestionCount = getFlaggedQuestionCount(id)

    // Extract clean title (remove "| MD3 SCP Cases" suffix)
    const caseTitle = metadata.title?.split('|')[0]?.trim() || ''

    return (
      <div
        key={id}
        className={`
          w-[320px] min-h-[100px]
          border rounded-lg
          flex flex-col
          transition-all duration-200
          relative
          ${completed
            ? 'bg-green-50 dark:bg-green-900/20 border-[#4CAF50]'
            : flagged
              ? 'bg-red-50 dark:bg-red-900/20 border-[#dc3545]'
              : 'bg-white dark:bg-gray-800 border-[#E8E3D9] dark:border-gray-700'
          }
          hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]
        `}
      >
        {/* Flagged Questions Badge */}
        {flaggedQuestionCount > 0 && (
          <div className="absolute bottom-4 left-4 bg-gradient-to-br from-[#fff5f5] to-[#ffe0e0] border border-[#e57373] text-[#c62828] text-[11px] font-semibold px-2.5 py-1 rounded-xl shadow-sm">
            🚩 {flaggedQuestionCount} flagged question{flaggedQuestionCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Case Content - Clickable Link */}
        <Link
          to={`/year${yearNum}/cases/${id}`}
          state={{ from: location.pathname }}
          className="flex-1 p-4 no-underline cursor-pointer"
        >
          <h3 className="text-[15px] font-semibold m-0 text-[#0A0A0A] dark:text-white leading-[1.4] tracking-[-0.01em]">
            {id}{caseTitle ? ` ${caseTitle}` : ''}
          </h3>
        </Link>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
          <div className="relative group">
            <button
              onClick={(e) => {
                e.preventDefault()
                toggleFlag(id)
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                flagged
                  ? 'bg-[#dc3545] text-white hover:bg-[#c82333]'
                  : 'bg-gray-100 dark:bg-gray-700 text-[#4B535A] dark:text-gray-400 hover:bg-[#FBF0ED] dark:hover:bg-gray-600'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${flagged ? 'fill-current' : ''}`} />
            </button>
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {flagged ? 'Unflag case' : 'Flag case'}
            </span>
          </div>

          <div className="relative group">
            <button
              onClick={(e) => {
                e.preventDefault()
                toggleComplete(id)
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                completed
                  ? 'bg-[#4CAF50] text-white hover:bg-[#45a049]'
                  : 'bg-gray-100 dark:bg-gray-700 text-[#4B535A] dark:text-gray-400 hover:bg-[#FBF0ED] dark:hover:bg-gray-600'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {completed ? 'Mark incomplete' : 'Mark complete'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Group Year 3 cases by week for display
  const year3CasesByWeek = year3Weeks
    .filter(week => {
      // Only show weeks that have cases matching the filter
      const weekCases = filteredCases.filter(c => {
        const weekNum = parseInt(c.id.split('.')[0])
        return weekNum === week.weekNumber
      })
      return weekCases.length > 0
    })

  // Render flagged content list for both years
  if (selectedGroup === 'flagged') {
    return (
      <div className="flex-1 pl-9 pr-10 py-6 pt-8 overflow-y-auto">
        <h2 className="font-[Georgia,'Times_New_Roman',serif] text-2xl mb-8 text-[#0A0A0A] dark:text-white font-medium tracking-[-0.02em]">
          Flagged Items
        </h2>
        <FlaggedContentList year={year} />
      </div>
    )
  }

  // Render Year 3 cases grouped by week
  if (year === '3') {
    return (
      <div className="flex-1 pl-9 pr-10 py-6 pt-8 overflow-y-auto">
        <h2 className="font-[Georgia,'Times_New_Roman',serif] text-2xl mb-8 text-[#0A0A0A] dark:text-white font-medium tracking-[-0.02em]">
          {getGroupTitle()}
        </h2>

        {filteredCases.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#4B535A] dark:text-gray-400 text-lg">
              No cases found in this category
            </p>
          </div>
        ) : (
          year3CasesByWeek.map(week => {
            const weekCases = filteredCases.filter(c => {
              const weekNum = parseInt(c.id.split('.')[0])
              return weekNum === week.weekNumber
            })

            return (
              <div key={week.id} className="mb-10">
                {/* Week Header */}
                <div className="text-sm font-semibold text-[#4B535A] dark:text-gray-400 mb-4 pb-2 border-b border-[#E8E3D9] dark:border-gray-700 uppercase tracking-wide">
                  Week {week.weekNumber} - {week.specialty}
                </div>

                {/* Cases Grid */}
                <div className="flex flex-wrap gap-5 mb-4">
                  {weekCases.map((caseModule) => renderCaseCard(caseModule, year))}
                </div>
              </div>
            )
          })
        )}
      </div>
    )
  }

  // Render Year 4 cases grouped by week
  return (
    <div className="flex-1 pl-9 pr-10 py-6 pt-8 overflow-y-auto">
      <h2 className="font-[Georgia,'Times_New_Roman',serif] text-2xl mb-8 text-[#0A0A0A] dark:text-white font-medium tracking-[-0.02em]">
        {getGroupTitle()}
      </h2>

      {year4CasesByWeek.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#4B535A] dark:text-gray-400 text-lg">
            No cases found in this category
          </p>
        </div>
      ) : (
        year4CasesByWeek.map(week => {
          const weekCases = filteredYear4Cases.filter(c => c.weekNumber === week.weekNumber)

          return (
            <div key={week.id} className="mb-10">
              {/* Week Header */}
              <div className="text-sm font-semibold text-[#4B535A] dark:text-gray-400 mb-4 pb-2 border-b border-[#E8E3D9] dark:border-gray-700 uppercase tracking-wide">
                WK{week.weekNumber} - {week.specialty}
              </div>

              {/* Cases Grid */}
              <div className="flex flex-wrap gap-5 mb-4">
                {weekCases.map((caseItem) => {
                  const caseId = `y4-${caseItem.id}`
                  const completed = isCompleted(caseId)
                  const flagged = isFlagged(caseId)
                  const flaggedQuestionCount = getFlaggedQuestionCount(caseId)

                  return (
                    <div
                      key={caseItem.id}
                      className={`
                        w-[320px] min-h-[100px]
                        border rounded-lg
                        flex flex-col
                        transition-all duration-200
                        relative
                        ${completed
                          ? 'bg-green-50 dark:bg-green-900/20 border-[#4CAF50]'
                          : flagged
                            ? 'bg-red-50 dark:bg-red-900/20 border-[#dc3545]'
                            : 'bg-white dark:bg-gray-800 border-[#E8E3D9] dark:border-gray-700'
                        }
                        hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                      `}
                    >
                      {/* Flagged Questions Badge */}
                      {flaggedQuestionCount > 0 && (
                        <div className="absolute bottom-4 left-4 bg-gradient-to-br from-[#fff5f5] to-[#ffe0e0] border border-[#e57373] text-[#c62828] text-[11px] font-semibold px-2.5 py-1 rounded-xl shadow-sm">
                          🚩 {flaggedQuestionCount} flagged question{flaggedQuestionCount !== 1 ? 's' : ''}
                        </div>
                      )}

                      {/* Case Content - Clickable Link */}
                      <Link
                        to={`/year4/cases/${caseItem.id}`}
                        state={{ from: location.pathname }}
                        className="flex-1 p-4 no-underline cursor-pointer"
                      >
                        <h3 className="text-[15px] font-semibold m-0 text-[#0A0A0A] dark:text-white leading-[1.4] tracking-[-0.01em]">
                          {caseItem.id.replace('y4.', '').replace('_', '.')} {caseItem.title}
                        </h3>
                      </Link>

                      {/* Action Buttons */}
                      <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
                        <div className="relative group">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              toggleFlag(caseId)
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                              flagged
                                ? 'bg-[#dc3545] text-white hover:bg-[#c82333]'
                                : 'bg-gray-100 dark:bg-gray-700 text-[#4B535A] dark:text-gray-400 hover:bg-[#FBF0ED] dark:hover:bg-gray-600'
                            }`}
                          >
                            <Flag className={`w-3.5 h-3.5 ${flagged ? 'fill-current' : ''}`} />
                          </button>
                          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {flagged ? 'Unflag case' : 'Flag case'}
                          </span>
                        </div>

                        <div className="relative group">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              toggleComplete(caseId)
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                              completed
                                ? 'bg-[#4CAF50] text-white hover:bg-[#45a049]'
                                : 'bg-gray-100 dark:bg-gray-700 text-[#4B535A] dark:text-gray-400 hover:bg-[#FBF0ED] dark:hover:bg-gray-600'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {completed ? 'Mark incomplete' : 'Mark complete'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
