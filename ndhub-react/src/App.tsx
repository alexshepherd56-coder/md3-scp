import { BrowserRouter, Routes, Route, Link, useParams, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { ProgressProvider } from '@/contexts/ProgressContext'
import { SearchProvider, useSearch } from '@/contexts/SearchContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { allCases } from '@/cases'
import Sidebar from '@/components/layout/Sidebar'
import CaseListPage from '@/pages/CaseListPage'
import CasePage from '@/pages/CasePage'
import YearSelectionPage from '@/pages/YearSelectionPage'

function Header() {
  const { user, signOut } = useAuth()
  const { isDark, toggleDark, isLudicrous, toggleLudicrous } = useTheme()
  const { query, search } = useSearch()
  const [showDropdown, setShowDropdown] = useState(false)

  const getUserInitial = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-[72px] bg-white dark:bg-gray-800 border-b border-[#E8E3D9] dark:border-gray-700 flex items-center justify-center px-8 z-[100] backdrop-blur-[10px]">
      {/* Left side - Logo */}
      <div className="absolute left-8 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <svg
            className="w-10 h-10 transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer hover:rotate-180"
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <circle cx="20" cy="20" r="6" fill="#0A0A0A"/>
              <path d="M20 4 Q20 12, 20 12" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round"/>
              <path d="M36 20 Q28 20, 28 20" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round"/>
              <path d="M20 36 Q20 28, 20 28" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round"/>
              <path d="M4 20 Q12 20, 12 20" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round"/>
              <path d="M29 11 Q24 16, 24 16" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M29 29 Q24 24, 24 24" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M11 29 Q16 24, 16 24" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M11 11 Q16 16, 16 16" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round"/>
            </g>
          </svg>
          <span className="font-[Georgia,'Times_New_Roman',serif] text-2xl font-medium text-[#0A0A0A] dark:text-white tracking-[-0.01em]">
            NDhub
          </span>
        </div>
      </div>

      {/* Center - Search */}
      <div className="max-w-[500px] w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          className="w-full px-[18px] py-[10px] border border-[#E8E3D9] dark:border-gray-600 rounded-lg bg-[#F9F6F1] dark:bg-gray-700 text-[#0A0A0A] dark:text-white text-sm transition-all duration-200 focus:outline-none focus:border-[#D97757] focus:bg-white dark:focus:bg-gray-800 focus:shadow-[0_0_0_3px_rgba(217,119,87,0.1)] placeholder:text-[#4B535A] placeholder:opacity-60"
          placeholder="Search for anything (e.g. Nephrotic Syndrome)"
        />
      </div>

      {/* Right side - Auth */}
      <div className="absolute right-8 flex items-center gap-4">
        {user ? (
          <div className="relative">
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-2xl font-medium cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(10,10,10,0.2)] hover:translate-y-[-1px] hover:shadow-[0_4px_12px_rgba(10,10,10,0.3)] font-[Georgia,'Times_New_Roman',serif] tracking-[-0.01em]"
            >
              {getUserInitial()}
            </div>

            {showDropdown && (
              <div className="absolute top-[52px] right-0 bg-white dark:bg-gray-800 border border-[#E8E3D9] dark:border-gray-700 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] min-w-[240px] z-[1000] animate-[dropdownFadeIn_0.2s_ease]">
                <div className="p-4 border-b border-[#E8E3D9] dark:border-gray-700">
                  <div className="text-[15px] font-semibold text-[#0A0A0A] dark:text-white mb-1">
                    {user.displayName || 'User'}
                  </div>
                  <div className="text-[13px] text-[#4B535A] dark:text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
                    {user.email}
                  </div>
                </div>

                <button
                  onClick={() => {
                    signOut()
                    setShowDropdown(false)
                  }}
                  className="w-full p-3 px-4 bg-transparent border-none text-[#D97757] text-sm font-medium cursor-pointer transition-colors duration-200 text-left hover:bg-[#FBF0ED] dark:hover:bg-gray-700"
                >
                  Sign Out
                </button>

                <Link
                  to="/"
                  onClick={() => window.location.href = '/'}
                  className="block w-[calc(100%-32px)] m-2 mx-4 p-2.5 px-4 bg-gradient-to-br from-[#667eea] to-[#764ba2] border-none rounded-lg text-white text-sm font-semibold cursor-pointer transition-all duration-300 text-center no-underline font-[Georgia,'Times_New_Roman',serif] shadow-[0_2px_8px_rgba(102,126,234,0.3)] hover:translate-y-[-2px] hover:shadow-[0_4px_12px_rgba(102,126,234,0.4)]"
                >
                  Switch Year
                </Link>

                <div className="flex justify-between items-center p-3 px-4">
                  <span className="text-sm text-[#4B535A] dark:text-gray-400">Dark Mode</span>
                  <label className="relative inline-block w-11 h-6">
                    <input
                      type="checkbox"
                      checked={isDark}
                      onChange={toggleDark}
                      className="opacity-0 w-0 h-0 peer"
                    />
                    <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#ccc] transition-colors duration-300 rounded-full peer-checked:bg-[#D97757] before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:transition-transform before:duration-300 before:rounded-full peer-checked:before:translate-x-5"></span>
                  </label>
                </div>

                <div className="flex justify-between items-center p-3 px-4">
                  <span className="text-sm text-[#4B535A] dark:text-gray-400">Ludicrous Mode</span>
                  <label className="relative inline-block w-11 h-6">
                    <input
                      type="checkbox"
                      checked={isLudicrous}
                      onChange={toggleLudicrous}
                      className="opacity-0 w-0 h-0 peer"
                    />
                    <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#ccc] transition-colors duration-300 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:transition-transform before:duration-300 before:rounded-full peer-checked:before:translate-x-5"></span>
                  </label>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button className="px-[18px] py-2 bg-[#D97757] text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 tracking-[-0.01em] hover:bg-[#C5654A] hover:translate-y-[-1px] hover:shadow-[0_4px_12px_rgba(217,119,87,0.25)]">
            Sign In
          </button>
        )}
      </div>
    </header>
  )
}

function YearContent() {
  const { year } = useParams<{ year: string }>()
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')

  const handleGroupSelect = (group: string) => {
    setSelectedGroup(group)
    setSelectedSpecialty('') // Clear specialty when switching groups
  }

  const handleSpecialtySelect = (specialty: string) => {
    setSelectedSpecialty(specialty)
    // Set appropriate group when selecting specialty
    const medicineSpecialties = ['cardiology', 'psychiatry', 'paediatrics', 'neurology', 'gastroenterology', 'endocrinology', 'renal', 'respiratory', 'rheumatology', 'haematology', 'og']
    if (medicineSpecialties.includes(specialty)) {
      setSelectedGroup('medicine')
    } else {
      setSelectedGroup('surgery')
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1] dark:bg-[#1a1a1a]">
      <Header />
      <Sidebar
        year={year || '4'}
        selectedGroup={selectedGroup}
        selectedSpecialty={selectedSpecialty}
        onGroupSelect={handleGroupSelect}
        onSpecialtySelect={handleSpecialtySelect}
      />

      <main className="pt-[72px]">
        <Routes>
          <Route
            path="/"
            element={
              <CaseListPage
                year={year || '4'}
                selectedGroup={selectedGroup}
                selectedSpecialty={selectedSpecialty}
              />
            }
          />
          <Route path="/cases/:caseId" element={<CasePage year={year || '4'} />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  // Prepare case metadata for SearchProvider
  const caseData = allCases.map(c => ({
    ...c.metadata,
    id: c.id
  }))

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ErrorBoundary>
          <AuthProvider>
            <ErrorBoundary>
              <ProgressProvider>
                <ErrorBoundary>
                  <SearchProvider caseData={caseData}>
                    <BrowserRouter>
                      <ErrorBoundary>
                        <Routes>
                          <Route path="/" element={<YearSelectionPage />} />
                          <Route path="/year3/*" element={<YearContent />} />
                          <Route path="/year4/*" element={<YearContent />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </ErrorBoundary>
                    </BrowserRouter>
                  </SearchProvider>
                </ErrorBoundary>
              </ProgressProvider>
            </ErrorBoundary>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
