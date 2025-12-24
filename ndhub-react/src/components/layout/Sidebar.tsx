import { useState } from 'react'
import { useProgress } from '@/contexts/ProgressContext'
import { allCases } from '@/cases'

interface SidebarProps {
  year: string
  selectedGroup: string
  selectedSpecialty: string
  onGroupSelect: (group: string) => void
  onSpecialtySelect: (specialty: string) => void
}

export default function Sidebar({ year, selectedGroup, selectedSpecialty, onGroupSelect, onSpecialtySelect }: SidebarProps) {
  const [scpsExpanded, setScpsExpanded] = useState(true)
  const { flaggedCaseCount } = useProgress()

  const yearTitle = year === '3' ? 'Year 3' : 'Year 4'

  // Filter cases by year first
  const yearCases = allCases.filter(c => {
    const weekNum = parseInt(c.id.split('.')[0])
    if (year === '3') {
      return weekNum >= 1 && weekNum <= 9
    } else {
      return weekNum >= 10
    }
  })

  // Count cases by group and specialty
  const countByGroup = (group: string) => {
    if (group === 'all') return yearCases.length
    if (group === 'flagged') return flaggedCaseCount
    return yearCases.filter(c => {
      const discipline = c.metadata.discipline?.toLowerCase() || ''
      if (group === 'medicine') {
        return discipline.includes('medicine') || discipline.includes('paediatrics') || discipline.includes('psychiatry')
      }
      if (group === 'surgery') {
        return discipline.includes('surgery')
      }
      return false
    }).length
  }

  const countBySpecialty = (specialty: string) => {
    return yearCases.filter(c => {
      const discipline = c.metadata.discipline?.toLowerCase() || ''
      const category = c.metadata.category?.toLowerCase() || ''

      switch (specialty) {
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
        default: return false
      }
    }).length
  }

  return (
    <div className="w-[280px] bg-white dark:bg-[#1f1f1f] border-r border-[#E8E3D9] dark:border-[#333333] text-[#0A0A0A] dark:text-[#e8e8e8] px-4 py-5 flex flex-col overflow-y-auto mt-[72px] fixed left-0 top-0 bottom-0">
      {/* Year Title */}
      <div className="px-3.5 mb-4">
        <h3 className="font-[Georgia,'Times_New_Roman',serif] text-xl font-medium text-[#0A0A0A] dark:text-white tracking-[-0.02em]">
          {yearTitle}
        </h3>
      </div>

      {/* Past Exams Section */}
      <h2 className="flex items-center text-base my-6 mb-2 font-normal px-3.5 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#FBF0ED] dark:hover:bg-[#2a2a2a] uppercase tracking-wide text-[#4B535A] dark:text-[#b0b0b0]">
        <svg className="w-[18px] h-[18px] mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
        past exams
      </h2>

      {/* SCPs Toggle */}
      <h2
        onClick={() => setScpsExpanded(!scpsExpanded)}
        className="flex items-center justify-between text-base my-6 mb-2 font-normal px-3.5 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#FBF0ED] dark:hover:bg-[#2a2a2a] uppercase tracking-wide text-[#4B535A] dark:text-[#b0b0b0] select-none"
      >
        <span className="flex items-center">
          <svg className="w-[18px] h-[18px] mr-2 flex-shrink-0 relative top-[3px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          SCPs
        </span>
        <span className={`text-xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${scpsExpanded ? 'rotate-90' : ''}`}>›</span>
      </h2>

      {/* SCPs Content */}
      <div className={`transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${scpsExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        {/* Flagged Cases */}
        {flaggedCaseCount > 0 && (
          <h2
            onClick={() => onGroupSelect('flagged')}
            className={`text-sm my-6 mb-2 font-semibold px-3.5 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#FBF0ED] dark:hover:bg-[#2a2a2a] ${selectedGroup === 'flagged' ? 'bg-[#FBF0ED] dark:bg-[#2a2a2a] text-[#D97757]' : ''}`}
          >
            Flagged Cases <span className="text-[13px] text-[#4B535A] dark:text-[#b0b0b0] opacity-70">({flaggedCaseCount})</span>
          </h2>
        )}

        {/* All SCPs */}
        <h2
          onClick={() => onGroupSelect('all')}
          className={`text-sm my-6 mb-2 font-semibold px-3.5 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#FBF0ED] dark:hover:bg-[#2a2a2a] ${selectedGroup === 'all' ? 'bg-[#FBF0ED] dark:bg-[#2a2a2a] text-[#D97757]' : ''}`}
        >
          All SCPs <span className="text-[13px] text-[#4B535A] dark:text-[#b0b0b0] opacity-70">({countByGroup('all')})</span>
        </h2>

        {/* Medicine */}
        <h2
          onClick={() => onGroupSelect('medicine')}
          className={`text-sm my-6 mb-2 font-semibold px-3.5 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#FBF0ED] dark:hover:bg-[#2a2a2a] ${selectedGroup === 'medicine' ? 'bg-[#FBF0ED] dark:bg-[#2a2a2a] text-[#D97757]' : ''}`}
        >
          Medicine <span className="text-[13px] text-[#4B535A] dark:text-[#b0b0b0] opacity-70">({countByGroup('medicine')})</span>
        </h2>

        {/* Medicine Specialties */}
        {['cardiology', 'psychiatry', 'paediatrics', 'neurology', 'gastroenterology', 'endocrinology', 'renal', 'respiratory', 'rheumatology', 'haematology', 'og'].map(specialty => {
          const count = countBySpecialty(specialty)
          const displayName = specialty === 'og' ? 'O&G' : specialty.charAt(0).toUpperCase() + specialty.slice(1)

          return (
            <div
              key={specialty}
              onClick={() => onSpecialtySelect(specialty)}
              className={`relative my-0.5 cursor-pointer flex justify-between items-center px-3.5 py-2.5 pl-7 rounded-lg transition-all duration-200 text-[15px] font-normal text-[#4B535A] dark:text-[#b0b0b0] hover:bg-[#FBF0ED] dark:hover:bg-[#2a2a2a] hover:text-[#0A0A0A] dark:hover:text-[#e8e8e8] ${selectedSpecialty === specialty ? 'bg-[#FBF0ED] dark:bg-[#2a2a2a] text-[#D97757] font-medium' : ''}`}
            >
              {displayName}
              {count > 0 && selectedSpecialty === specialty && (
                <span className="absolute right-3.5 top-2.5 text-xs text-[#4B535A] dark:text-[#b0b0b0] font-medium">
                  {count}
                </span>
              )}
            </div>
          )
        })}

        {/* Surgery */}
        <h2
          onClick={() => onGroupSelect('surgery')}
          className={`text-sm my-6 mb-2 font-semibold px-3.5 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#FBF0ED] dark:hover:bg-[#2a2a2a] ${selectedGroup === 'surgery' ? 'bg-[#FBF0ED] dark:bg-[#2a2a2a] text-[#D97757]' : ''}`}
        >
          Surgery <span className="text-[13px] text-[#4B535A] dark:text-[#b0b0b0] opacity-70">({countByGroup('surgery')})</span>
        </h2>

        {/* Surgery Specialties */}
        {['git', 'general', 'breast', 'ortho', 'vascular'].map(specialty => {
          const count = countBySpecialty(specialty)
          const displayName = specialty === 'git' ? 'GIT' :
                            specialty === 'breast' ? 'Breast & Endocrine' :
                            specialty === 'ortho' ? 'Ortho' :
                            specialty.charAt(0).toUpperCase() + specialty.slice(1)

          return (
            <div
              key={specialty}
              onClick={() => onSpecialtySelect(specialty)}
              className={`relative my-0.5 cursor-pointer flex justify-between items-center px-3.5 py-2.5 pl-7 rounded-lg transition-all duration-200 text-[15px] font-normal text-[#4B535A] dark:text-[#b0b0b0] hover:bg-[#FBF0ED] dark:hover:bg-[#2a2a2a] hover:text-[#0A0A0A] dark:hover:text-[#e8e8e8] ${selectedSpecialty === specialty ? 'bg-[#FBF0ED] dark:bg-[#2a2a2a] text-[#D97757] font-medium' : ''}`}
            >
              {displayName}
              {count > 0 && selectedSpecialty === specialty && (
                <span className="absolute right-3.5 top-2.5 text-xs text-[#4B535A] dark:text-[#b0b0b0] font-medium">
                  {count}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="mt-auto pt-4 text-center text-[11px] text-[rgba(10,37,64,0.5)] dark:text-[rgba(232,232,232,0.5)] uppercase tracking-[0.5px] flex-shrink-0 font-[Georgia,'Times_New_Roman',serif]">
        powered by sheptech ©
      </div>
    </div>
  )
}
