import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { year3Weeks, year4Weeks } from '@/data/weeks'
import { useProgress } from '@/contexts/ProgressContext'

interface SidebarProps {
  year: string
  selectedGroup?: string
  selectedSpecialty?: string
  onGroupSelect?: (group: string) => void
  onSpecialtySelect?: (specialty: string) => void
}

// Year 3 Medicine subspecialties
const year3MedicineSpecialties = [
  { id: 'cardiology', name: 'Cardiology' },
  { id: 'psychiatry', name: 'Psychiatry' },
  { id: 'paediatrics', name: 'Paediatrics' },
  { id: 'neurology', name: 'Neurology' },
  { id: 'gastroenterology', name: 'Gastroenterology' },
  { id: 'endocrinology', name: 'Endocrinology' },
  { id: 'renal', name: 'Renal' },
  { id: 'respiratory', name: 'Respiratory' },
  { id: 'rheumatology', name: 'Rheumatology' },
  { id: 'haematology', name: 'Haematology' },
  { id: 'og', name: 'O&G' },
]

// Year 3 Surgery subspecialties
const year3SurgerySpecialties = [
  { id: 'git', name: 'GIT' },
  { id: 'general', name: 'General' },
  { id: 'breast', name: 'Breast & Endocrine' },
  { id: 'ortho', name: 'Ortho' },
  { id: 'vascular', name: 'Vascular' },
]

export default function Sidebar({ year, selectedGroup, selectedSpecialty, onGroupSelect, onSpecialtySelect }: SidebarProps) {
  const [weeklyExpanded, setWeeklyExpanded] = useState(false)
  const [scpsExpanded, setScpsExpanded] = useState(true)
  const [medicineExpanded, setMedicineExpanded] = useState(false)
  const [surgeryExpanded, setSurgeryExpanded] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { flaggedCount } = useProgress()

  // Year-specific accent colors
  const accentBg = year === '3' ? 'bg-[#FBF0ED]' : 'bg-[#E8F1F8]'
  const accentText = year === '3' ? 'text-[#D97757]' : 'text-[#2D5A7B]'

  // Get weeks data for this year
  const weeks = year === '3' ? year3Weeks : year4Weeks

  // Handle navigation item click for Year 3 SCPs
  const handleNavClick = (group: string, specialty?: string) => {
    if (onGroupSelect) onGroupSelect(group)
    if (onSpecialtySelect) onSpecialtySelect(specialty || '')
    // Always navigate to year base route to show filtered cases
    const basePath = `/year${year}`
    if (location.pathname !== basePath && location.pathname !== `${basePath}/`) {
      navigate(basePath)
    }
  }

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-[#1f1f1f] border-r border-[#E8E3D9] dark:border-[#333333] px-6 pb-4 w-[280px] fixed left-0 top-0 bottom-0 z-[90]">
      {/* Brand Header with Year Switcher */}
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#E8E3D9] dark:border-[#333]">
        <button
          onClick={() => {
            if (onGroupSelect) onGroupSelect('flagged')
            if (onSpecialtySelect) onSpecialtySelect('')
            navigate(`/year${year}`)
          }}
          className="flex items-center gap-2 border-none bg-transparent cursor-pointer text-left"
        >
          <svg
            className="w-6 h-6 transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:rotate-180"
            width="24"
            height="24"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <circle cx="20" cy="20" r="6" className="fill-[#0A0A0A] dark:fill-white"/>
              <path d="M20 4 Q20 12, 20 12" className="stroke-[#0A0A0A] dark:stroke-white" strokeWidth="4" strokeLinecap="round"/>
              <path d="M36 20 Q28 20, 28 20" className="stroke-[#0A0A0A] dark:stroke-white" strokeWidth="4" strokeLinecap="round"/>
              <path d="M20 36 Q20 28, 20 28" className="stroke-[#0A0A0A] dark:stroke-white" strokeWidth="4" strokeLinecap="round"/>
              <path d="M4 20 Q12 20, 12 20" className="stroke-[#0A0A0A] dark:stroke-white" strokeWidth="4" strokeLinecap="round"/>
              <path d="M29 11 Q24 16, 24 16" className="stroke-[#0A0A0A] dark:stroke-white" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M29 29 Q24 24, 24 24" className="stroke-[#0A0A0A] dark:stroke-white" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M11 29 Q16 24, 16 24" className="stroke-[#0A0A0A] dark:stroke-white" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M11 11 Q16 16, 16 16" className="stroke-[#0A0A0A] dark:stroke-white" strokeWidth="3.5" strokeLinecap="round"/>
            </g>
          </svg>
          <span className="font-[Georgia,'Times_New_Roman',serif] text-lg font-medium text-[#0A0A0A] dark:text-white tracking-[-0.01em]">
            NDhub
          </span>
        </button>

        {/* Year Switcher */}
        <div className="flex gap-1">
          {/* Show both when no year selected */}
          {!year && (
            <>
              <Link
                to="/year3"
                className="flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs font-medium no-underline transition-all bg-[#F9F6F1] dark:bg-[#2a2a2a] text-[#4B535A] dark:text-[#888] hover:bg-[#FBF0ED] dark:hover:bg-[#333] hover:text-[#D97757]"
              >
                Yr 3
              </Link>
              <Link
                to="/year4"
                className="flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs font-medium no-underline transition-all bg-[#F9F6F1] dark:bg-[#2a2a2a] text-[#4B535A] dark:text-[#888] hover:bg-[#E8F1F8] dark:hover:bg-[#333] hover:text-[#2D5A7B]"
              >
                Yr 4
              </Link>
            </>
          )}
          {/* Year 3 selected */}
          {year === '3' && (
            <Link
              to="/year4"
              className="group flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium no-underline transition-all bg-[#D97757] text-white hover:bg-[#2D5A7B]"
            >
              <span className="group-hover:hidden">Year 3</span>
              <span className="hidden group-hover:inline">Year 4 →</span>
            </Link>
          )}
          {/* Year 4 selected */}
          {year === '4' && (
            <Link
              to="/year3"
              className="group flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium no-underline transition-all bg-[#2D5A7B] text-white hover:bg-[#D97757]"
            >
              <span className="group-hover:hidden">Year 4</span>
              <span className="hidden group-hover:inline">← Year 3</span>
            </Link>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col pt-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          {/* Year 3: SCPs Section */}
          {year === '3' && (
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {/* SCPs Header */}
                <li>
                  <button
                    type="button"
                    onClick={() => setScpsExpanded(!scpsExpanded)}
                    className={`group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold transition-colors ${
                      scpsExpanded
                        ? 'bg-[#FBF0ED] dark:bg-[#2a2a2a] text-[#D97757]'
                        : 'text-[#4B535A] dark:text-[#b0b0b0] hover:bg-[#F9F6F1] dark:hover:bg-[#2a2a2a] hover:text-[#0A0A0A] dark:hover:text-white'
                    }`}
                  >
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    SCPs
                    <svg
                      className={`ml-auto h-5 w-5 shrink-0 transition-transform duration-200 ${scpsExpanded ? 'rotate-90' : ''}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* SCPs Submenu */}
                  <ul className={`mt-1 space-y-1 overflow-hidden transition-all duration-300 ${scpsExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {/* Flagged Cases */}
                    <li>
                      <button
                        type="button"
                        onClick={() => handleNavClick('flagged')}
                        className={`group flex w-full items-center gap-x-3 rounded-md py-2 pl-9 pr-2 text-sm transition-colors ${
                          selectedGroup === 'flagged' && !selectedSpecialty
                            ? 'bg-[#FBF0ED] dark:bg-[#2a2a2a] text-[#D97757] font-medium'
                            : 'text-[#4B535A] dark:text-[#b0b0b0] hover:bg-[#F9F6F1] dark:hover:bg-[#2a2a2a] hover:text-[#0A0A0A] dark:hover:text-white'
                        }`}
                      >
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                          <line x1="4" y1="22" x2="4" y2="15"></line>
                        </svg>
                        Flagged
                        <span className="ml-auto inline-flex items-center rounded-full bg-[#D97757]/10 px-2 py-0.5 text-xs font-medium text-[#D97757]">
                          {flaggedCount}
                        </span>
                      </button>
                    </li>

                    {/* All SCPs */}
                    <li>
                      <button
                        type="button"
                        onClick={() => handleNavClick('all')}
                        className={`group flex w-full items-center gap-x-3 rounded-md py-2 pl-9 pr-2 text-sm transition-colors ${
                          selectedGroup === 'all' && !selectedSpecialty
                            ? 'bg-[#FBF0ED] dark:bg-[#2a2a2a] text-[#D97757] font-medium'
                            : 'text-[#4B535A] dark:text-[#b0b0b0] hover:bg-[#F9F6F1] dark:hover:bg-[#2a2a2a] hover:text-[#0A0A0A] dark:hover:text-white'
                        }`}
                      >
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        All Cases
                      </button>
                    </li>

                    {/* Medicine Section */}
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setMedicineExpanded(!medicineExpanded)
                          handleNavClick('medicine')
                        }}
                        className={`group flex w-full items-center gap-x-3 rounded-md py-2 pl-9 pr-2 text-sm transition-colors ${
                          selectedGroup === 'medicine' && !selectedSpecialty
                            ? 'bg-[#FBF0ED] dark:bg-[#2a2a2a] text-[#D97757] font-medium'
                            : 'text-[#4B535A] dark:text-[#b0b0b0] hover:bg-[#F9F6F1] dark:hover:bg-[#2a2a2a] hover:text-[#0A0A0A] dark:hover:text-white'
                        }`}
                      >
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                        </svg>
                        Medicine
                        <svg
                          className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${medicineExpanded ? 'rotate-90' : ''}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Medicine Subspecialties */}
                      <ul className={`mt-1 space-y-1 overflow-hidden transition-all duration-300 ${medicineExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {year3MedicineSpecialties.map(specialty => (
                          <li key={specialty.id}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleNavClick('medicine', specialty.id)
                              }}
                              className={`group flex w-full items-center rounded-md py-1.5 pl-14 pr-2 text-sm transition-colors ${
                                selectedSpecialty === specialty.id
                                  ? 'bg-[#FBF0ED] dark:bg-[#2a2a2a] text-[#D97757] font-medium'
                                  : 'text-[#4B535A] dark:text-[#b0b0b0] hover:bg-[#F9F6F1] dark:hover:bg-[#2a2a2a] hover:text-[#0A0A0A] dark:hover:text-white'
                              }`}
                            >
                              {specialty.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>

                    {/* Surgery Section */}
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setSurgeryExpanded(!surgeryExpanded)
                          handleNavClick('surgery')
                        }}
                        className={`group flex w-full items-center gap-x-3 rounded-md py-2 pl-9 pr-2 text-sm transition-colors ${
                          selectedGroup === 'surgery' && !selectedSpecialty
                            ? 'bg-[#FBF0ED] dark:bg-[#2a2a2a] text-[#D97757] font-medium'
                            : 'text-[#4B535A] dark:text-[#b0b0b0] hover:bg-[#F9F6F1] dark:hover:bg-[#2a2a2a] hover:text-[#0A0A0A] dark:hover:text-white'
                        }`}
                      >
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="14.31" y1="8" x2="20.05" y2="17.94"></line>
                          <line x1="9.69" y1="8" x2="21.17" y2="8"></line>
                          <line x1="7.38" y1="12" x2="13.12" y2="2.06"></line>
                          <line x1="9.69" y1="16" x2="3.95" y2="6.06"></line>
                          <line x1="14.31" y1="16" x2="2.83" y2="16"></line>
                          <line x1="16.62" y1="12" x2="10.88" y2="21.94"></line>
                        </svg>
                        Surgery
                        <svg
                          className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${surgeryExpanded ? 'rotate-90' : ''}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Surgery Subspecialties */}
                      <ul className={`mt-1 space-y-1 overflow-hidden transition-all duration-300 ${surgeryExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {year3SurgerySpecialties.map(specialty => (
                          <li key={specialty.id}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleNavClick('surgery', specialty.id)
                              }}
                              className={`group flex w-full items-center rounded-md py-1.5 pl-14 pr-2 text-sm transition-colors ${
                                selectedSpecialty === specialty.id
                                  ? 'bg-[#FBF0ED] dark:bg-[#2a2a2a] text-[#D97757] font-medium'
                                  : 'text-[#4B535A] dark:text-[#b0b0b0] hover:bg-[#F9F6F1] dark:hover:bg-[#2a2a2a] hover:text-[#0A0A0A] dark:hover:text-white'
                              }`}
                            >
                              {specialty.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          )}

          {/* Weekly Resources Section */}
          {weeks.length > 0 && (
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => setWeeklyExpanded(!weeklyExpanded)}
                    className={`group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold transition-colors ${
                      weeklyExpanded
                        ? `${accentBg} dark:bg-[#2a2a2a] ${accentText}`
                        : 'text-[#4B535A] dark:text-[#b0b0b0] hover:bg-[#F9F6F1] dark:hover:bg-[#2a2a2a] hover:text-[#0A0A0A] dark:hover:text-white'
                    }`}
                  >
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Weekly Resources
                    <svg
                      className={`ml-auto h-5 w-5 shrink-0 transition-transform duration-200 ${weeklyExpanded ? 'rotate-90' : ''}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <ul className={`mt-1 space-y-1 overflow-hidden transition-all duration-300 ${weeklyExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {weeks.map(week => {
                      const isActive = location.pathname.includes(`/weekly/${week.id}`)
                      return (
                        <li key={week.id}>
                          <Link
                            to={`/year${year}/weekly/${week.id}`}
                            className={`group flex items-center rounded-md py-2 pl-9 pr-2 text-sm no-underline transition-colors ${
                              isActive
                                ? `${accentBg} dark:bg-[#2a2a2a] ${accentText} font-medium`
                                : 'text-[#4B535A] dark:text-[#b0b0b0] hover:bg-[#F9F6F1] dark:hover:bg-[#2a2a2a] hover:text-[#0A0A0A] dark:hover:text-white'
                            }`}
                          >
                            {week.displayName}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              </ul>
            </li>
          )}

          {/* Past Exams Section */}
          {year === '3' && (
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                <li>
                  <Link
                    to={`/year${year}/exams`}
                    className={`group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold no-underline transition-colors ${
                      location.pathname.includes('/exams')
                        ? 'bg-[#FBF0ED] dark:bg-[#2a2a2a] text-[#D97757]'
                        : 'text-[#4B535A] dark:text-[#b0b0b0] hover:bg-[#F9F6F1] dark:hover:bg-[#2a2a2a] hover:text-[#0A0A0A] dark:hover:text-white'
                    }`}
                  >
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    Past Exams
                  </Link>
                </li>
              </ul>
            </li>
          )}

          {/* Footer */}
          <li className="mt-auto">
            <div className="pt-4 text-center text-[10px] text-[#4B535A]/50 dark:text-[#888]/50 uppercase tracking-[0.5px] font-[Georgia,'Times_New_Roman',serif]">
              powered by sheptech
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )
}
