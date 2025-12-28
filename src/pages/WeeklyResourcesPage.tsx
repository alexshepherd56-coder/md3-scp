import { useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { getWeekById } from '@/data/weeks'
import { getLOsByWeekId, getLOGroups } from '@/data/los/year4-week1'
import { useProgress } from '@/contexts/ProgressContext'
import { useLONotes } from '@/contexts/LONotesContext'
import { LODrawer } from '@/components/LODrawer'
import { Flag, Check, NotebookPen, ChevronDown, ChevronRight } from 'lucide-react'
import type { LearningObjective } from '@/types/week'

interface WeeklyResourcesPageProps {
  year: string
}

export default function WeeklyResourcesPage({ year }: WeeklyResourcesPageProps) {
  const { weekId } = useParams<{ weekId: string }>()
  const location = useLocation()
  const { isCompleted, isFlagged, toggleComplete, toggleFlag, getFlaggedQuestionCount } = useProgress()
  const { isCompleted: isLOCompleted, hasNotes, getCompletedCount, isFlagged: isLOFlagged, getFlaggedCount } = useLONotes()

  const [selectedLO, setSelectedLO] = useState<LearningObjective | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const week = weekId ? getWeekById(weekId) : null
  const los = weekId ? getLOsByWeekId(weekId) : []
  const loGroups = weekId ? getLOGroups(weekId) : []
  const loIds = los.map(lo => lo.id)
  const completedCount = getCompletedCount(loIds)
  const flaggedCount = getFlaggedCount(loIds)

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(group)) {
        next.delete(group)
      } else {
        next.add(group)
      }
      return next
    })
  }

  const expandAllGroups = () => {
    setExpandedGroups(new Set(loGroups))
  }

  const handleLOClick = (lo: LearningObjective) => {
    setSelectedLO(lo)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    // Delay clearing selected LO for smooth animation
    setTimeout(() => setSelectedLO(null), 300)
  }

  if (!week) {
    return (
      <div className="flex-1 pl-9 pr-10 py-6 pt-8 overflow-y-auto">
        <div className="text-center py-16">
          <p className="text-[#4B535A] dark:text-gray-400 text-lg">
            Week not found
          </p>
        </div>
      </div>
    )
  }

  // Group LOs by their group property
  const losByGroup = los.reduce((acc, lo) => {
    const group = lo.group || 'General'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(lo)
    return acc
  }, {} as Record<string, LearningObjective[]>)

  return (
    <div className="flex-1 pl-9 pr-10 py-6 pt-8 overflow-y-auto">
      {/* Week Title */}
      <h1 className="font-[Georgia,'Times_New_Roman',serif] text-3xl font-normal text-[#0A0A0A] dark:text-white tracking-[-0.02em] mb-8">
        Week {week.weekNumber} - {week.specialty} Resources
      </h1>

      {/* Learning Objectives Section */}
      {week.hasLearningObjectives && los.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#E8E3D9] dark:border-gray-700">
            <h2 className="font-[Georgia,'Times_New_Roman',serif] text-xl font-medium text-[#0A0A0A] dark:text-white tracking-[-0.02em]">
              Learning Objectives
            </h2>
            <div className="flex items-center gap-4">
              {/* Flagged indicator */}
              {flaggedCount > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full">
                  <Flag className="w-3.5 h-3.5 text-red-500 fill-current" />
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">
                    {flaggedCount} flagged
                  </span>
                </div>
              )}
              {/* Progress indicator */}
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-[#E8E3D9] dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4CAF50] rounded-full transition-all duration-300"
                    style={{ width: `${(completedCount / los.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-[#4B535A] dark:text-gray-400">
                  {completedCount}/{los.length}
                </span>
              </div>
              {/* Expand all button */}
              <button
                onClick={expandAllGroups}
                className="text-sm text-[#D97757] hover:text-[#c5664a] font-medium"
              >
                Expand All
              </button>
            </div>
          </div>

          {/* LO Groups */}
          <div className="space-y-4">
            {loGroups.map(group => {
              const groupLOs = losByGroup[group] || []
              const isExpanded = expandedGroups.has(group)
              const groupCompletedCount = getCompletedCount(groupLOs.map(lo => lo.id))

              return (
                <div
                  key={group}
                  className="border border-[#E8E3D9] dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
                >
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#F9F6F1] dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-[#4B535A] dark:text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[#4B535A] dark:text-gray-400" />
                      )}
                      <h3 className="text-[15px] font-semibold text-[#0A0A0A] dark:text-white">
                        {group}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#4B535A] dark:text-gray-400">
                        {groupCompletedCount}/{groupLOs.length} complete
                      </span>
                      {groupCompletedCount === groupLOs.length && groupLOs.length > 0 && (
                        <Check className="w-4 h-4 text-[#4CAF50]" />
                      )}
                    </div>
                  </button>

                  {/* LO Items */}
                  {isExpanded && (
                    <div className="border-t border-[#E8E3D9] dark:border-gray-700">
                      {groupLOs.map((lo, index) => {
                        const completed = isLOCompleted(lo.id)
                        const hasNote = hasNotes(lo.id)
                        const flagged = isLOFlagged(lo.id)
                        const loNumber = lo.id.replace('w1-lo-', '')

                        return (
                          <div
                            key={lo.id}
                            onClick={() => handleLOClick(lo)}
                            className={`flex items-start gap-3 p-4 cursor-pointer transition-all hover:bg-[#FBF0ED] dark:hover:bg-gray-700/50 ${
                              index !== groupLOs.length - 1 ? 'border-b border-[#E8E3D9] dark:border-gray-700' : ''
                            } ${completed ? 'bg-green-50/50 dark:bg-green-900/10' : ''} ${flagged && !completed ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
                          >
                            {/* Status indicator */}
                            <div className="flex-shrink-0 mt-0.5">
                              {completed ? (
                                <div className="w-6 h-6 rounded-full bg-[#4CAF50] flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-white" />
                                </div>
                              ) : flagged ? (
                                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                                  <Flag className="w-3 h-3 text-white fill-current" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-[#E8E3D9] dark:border-gray-600" />
                              )}
                            </div>

                            {/* LO content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-[#D97757]">
                                  LO {loNumber}
                                </span>
                                {flagged && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                                    Flagged
                                  </span>
                                )}
                                {hasNote && (
                                  <NotebookPen className="w-3.5 h-3.5 text-[#D97757]" />
                                )}
                              </div>
                              <p className="text-[14px] text-[#0A0A0A] dark:text-white leading-relaxed">
                                {lo.text}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* SCPs Section */}
      <section className="mb-12">
        <h2 className="font-[Georgia,'Times_New_Roman',serif] text-xl font-medium text-[#0A0A0A] dark:text-white tracking-[-0.02em] mb-6 pb-3 border-b border-[#E8E3D9] dark:border-gray-700">
          SCPs
        </h2>
        <div className="flex flex-wrap gap-5">
          {week.cases.map((caseItem) => {
            const completed = isCompleted(caseItem.id)
            const flagged = isFlagged(caseItem.id)
            const flaggedQuestionCount = getFlaggedQuestionCount(caseItem.id)

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
                  <div className="absolute bottom-3 left-3 bg-gradient-to-br from-[#fff5f5] to-[#ffe0e0] border border-[#e57373] text-[#c62828] text-[11px] font-semibold px-2.5 py-1 rounded-xl shadow-sm">
                    {flaggedQuestionCount} flagged question{flaggedQuestionCount !== 1 ? 's' : ''}
                  </div>
                )}

                {/* Case Content - Clickable Link */}
                <Link
                  to={`/year${year}/cases/${caseItem.id}`}
                  state={{ from: location.pathname }}
                  className="flex-1 p-5 pb-12 no-underline cursor-pointer"
                >
                  <h3 className="text-[15px] font-semibold m-0 text-[#0A0A0A] dark:text-white leading-[1.4] tracking-[-0.01em] mb-1">
                    {caseItem.id.replace(/^y4\./, '').replace('_', '.')} {caseItem.title}
                  </h3>
                </Link>

                {/* Action Buttons */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                  <div className="relative group">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        toggleFlag(caseItem.id)
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
                        toggleComplete(caseItem.id)
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
      </section>

      {/* LO Drawer */}
      <LODrawer
        lo={selectedLO}
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
      />
    </div>
  )
}
