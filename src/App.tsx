import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { UnsavedChangesProvider } from '@/contexts/UnsavedChangesContext'
import AuthModal from '@/components/AuthModal'
import UnsavedChangesModal from '@/components/UnsavedChangesModal'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { ProgressProvider } from '@/contexts/ProgressContext'
import { SearchProvider, useSearch } from '@/contexts/SearchContext'
import { TextMarkupProvider } from '@/contexts/TextMarkupContext'
import { AnnotationsProvider } from '@/contexts/AnnotationsContext'
import { LONotesProvider } from '@/contexts/LONotesContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { allCases } from '@/cases'
import Sidebar from '@/components/layout/Sidebar'
import CaseListPage from '@/pages/CaseListPage'
import CasePage from '@/pages/CasePage'
import WeeklyResourcesPage from '@/pages/WeeklyResourcesPage'

// Helper to get/set saved year
const YEAR_STORAGE_KEY = 'ndhub-selected-year'

function getSavedYear(): string | null {
  try {
    return localStorage.getItem(YEAR_STORAGE_KEY)
  } catch {
    return null
  }
}

function saveYear(year: string) {
  try {
    localStorage.setItem(YEAR_STORAGE_KEY, year)
  } catch {
    // Ignore storage errors
  }
}

// Year selection content for welcome page
function YearSelectionContent() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-72px)]">
      <div className="flex gap-4">
        <Link
          to="/year3"
          onClick={() => saveYear('3')}
          className="flex items-center justify-center px-8 py-4 rounded-xl text-lg font-medium no-underline transition-all bg-[#D97757] text-white hover:bg-[#c5664a] hover:scale-105 shadow-lg"
        >
          Year 3
        </Link>
        <Link
          to="/year4"
          onClick={() => saveYear('4')}
          className="flex items-center justify-center px-8 py-4 rounded-xl text-lg font-medium no-underline transition-all bg-[#2D5A7B] text-white hover:bg-[#234a66] hover:scale-105 shadow-lg"
        >
          Year 4
        </Link>
      </div>
    </div>
  )
}

// Welcome page - redirects if year is saved, otherwise shows selection
function WelcomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin')
  const savedYear = getSavedYear()

  // Redirect to saved year if exists
  if (savedYear === '3' || savedYear === '4') {
    return <Navigate to={`/year${savedYear}`} replace />
  }

  const handleSignIn = () => {
    setAuthModalMode('signin')
    setShowAuthModal(true)
  }

  const handleCreateAccount = () => {
    setAuthModalMode('signup')
    setShowAuthModal(true)
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1] dark:bg-[#1a1a1a]">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authModalMode} />
      <UnsavedChangesModal onSignIn={handleSignIn} onCreateAccount={handleCreateAccount} />
      <Sidebar year="" />
      <SearchHeader onSignInClick={handleSignIn} />
      <main className="pl-[280px] pt-[72px]">
        <YearSelectionContent />
      </main>
    </div>
  )
}
import ExamListPage from '@/pages/ExamListPage'
import SAQExamPage from '@/pages/SAQExamPage'
import MCQExamPage from '@/pages/MCQExamPage'
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage'
import DataDeletionPage from '@/pages/DataDeletionPage'

function SearchHeader({ onSignInClick }: { onSignInClick: () => void }) {
  const { query, search, results, clearSearch, isSearching } = useSearch()
  const { user, signOut } = useAuth()
  const { isDark, toggleDark } = useTheme()
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getUserInitials = () => {
    if (user?.displayName) {
      const names = user.displayName.split(' ')
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
      }
      return names[0].charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <header className="fixed top-0 left-[280px] right-0 h-[72px] bg-[#F9F6F1] dark:bg-[#1a1a1a] border-b border-[#E8E3D9] dark:border-[#333] flex items-center justify-between px-6 z-[80]">
      {/* Search */}
      <div className="max-w-[600px] w-full relative" ref={searchRef}>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888] dark:text-[#666]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              search(e.target.value)
              setShowSearchResults(true)
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-10 pr-4 py-2 border-none rounded-lg bg-transparent text-[#0A0A0A] dark:text-white text-sm transition-all duration-200 focus:outline-none placeholder:text-[#888] dark:placeholder:text-[#666]"
            placeholder="Search for anything..."
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && isSearching && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1f1f1f] border border-[#E8E3D9] dark:border-[#333] rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-[200]">
            {results.length === 0 ? (
              <div className="p-4 text-center text-[#4B535A] dark:text-[#888] text-sm">
                No results found for "{query}"
              </div>
            ) : (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-[#4B535A] dark:text-[#888] uppercase tracking-wide border-b border-[#E8E3D9] dark:border-[#333]">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </div>
                {results.slice(0, 10).map((result) => (
                  <Link
                    key={result.id}
                    to={`/year3/cases/${result.id}`}
                    onClick={() => {
                      setShowSearchResults(false)
                      clearSearch()
                    }}
                    className="block px-4 py-3 hover:bg-[#F9F6F1] dark:hover:bg-[#2a2a2a] border-b border-[#E8E3D9] dark:border-[#333] last:border-b-0 transition-colors no-underline"
                  >
                    <div className="text-sm font-medium text-[#0A0A0A] dark:text-white">
                      {result.id} {result.title}
                    </div>
                    <div className="text-xs text-[#4B535A] dark:text-[#888] mt-0.5">
                      {result.category} • {result.discipline}
                    </div>
                  </Link>
                ))}
                {results.length > 10 && (
                  <div className="px-4 py-2 text-xs text-center text-[#4B535A] dark:text-[#888] bg-[#F9F6F1] dark:bg-[#2a2a2a]">
                    +{results.length - 10} more results
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* User Section */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        {user ? (
          <>
            <span className="text-sm font-medium text-[#0A0A0A] dark:text-white font-sans">
              {user.displayName || 'User'}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2"
              >
                <div className="w-9 h-9 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-sm font-semibold font-sans cursor-pointer hover:opacity-90 transition-opacity">
                  {getUserInitials()}
                </div>
                <svg className={`w-4 h-4 text-[#4B535A] dark:text-[#888] transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-[#1f1f1f] border border-[#E8E3D9] dark:border-[#333] rounded-xl shadow-lg min-w-[220px] z-[200] overflow-hidden">
                  {/* User Info */}
                  <div className="p-4 border-b border-[#E8E3D9] dark:border-[#333]">
                    <div className="text-sm font-semibold text-[#0A0A0A] dark:text-white font-sans">
                      {user.displayName || 'User'}
                    </div>
                    <div className="text-xs text-[#4B535A] dark:text-[#888] mt-0.5 truncate">
                      {user.email}
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="p-2">
                    {/* Dark Mode */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F9F6F1] dark:hover:bg-[#2a2a2a]">
                      <div className="flex items-center gap-3">
                        <svg className="h-4 w-4 text-[#4B535A] dark:text-[#888]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                        <span className="text-sm text-[#0A0A0A] dark:text-white">Dark Mode</span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleDark}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${isDark ? 'bg-[#D97757]' : 'bg-[#ccc]'}`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-2 border-t border-[#E8E3D9] dark:border-[#333]">
                    <button
                      onClick={() => {
                        signOut()
                        setShowUserDropdown(false)
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[#FBF0ED] dark:hover:bg-[#2a2a2a] text-left"
                    >
                      <svg className="h-4 w-4 text-[#D97757]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      <span className="text-sm text-[#D97757] font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={onSignInClick}
            className="px-4 py-2 bg-[#D97757] text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#C5654A]"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  )
}

// Layout with Header and Sidebar for list pages
function YearListLayout() {
  // Extract year from URL path since routes are /year3/* and /year4/*
  const location = useLocation()
  const year = location.pathname.includes('/year3') ? '3' : '4'
  const [selectedGroup, setSelectedGroup] = useState('flagged')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin')

  // Save year to localStorage when it changes
  useEffect(() => {
    saveYear(year)
  }, [year])

  const handleGroupSelect = (group: string) => {
    setSelectedGroup(group)
    setSelectedSpecialty('') // Clear specialty when switching groups
  }

  const handleSpecialtySelect = (specialty: string) => {
    setSelectedSpecialty(specialty)
    // Only set group when a specific specialty is selected (not when clearing)
    if (specialty) {
      const medicineSpecialties = ['cardiology', 'psychiatry', 'paediatrics', 'neurology', 'gastroenterology', 'endocrinology', 'renal', 'respiratory', 'rheumatology', 'haematology', 'og']
      if (medicineSpecialties.includes(specialty)) {
        setSelectedGroup('medicine')
      } else {
        setSelectedGroup('surgery')
      }
    }
  }

  const handleSignIn = () => {
    setAuthModalMode('signin')
    setShowAuthModal(true)
  }

  const handleCreateAccount = () => {
    setAuthModalMode('signup')
    setShowAuthModal(true)
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1] dark:bg-[#1a1a1a]">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authModalMode} />
      <UnsavedChangesModal onSignIn={handleSignIn} onCreateAccount={handleCreateAccount} />
      <Sidebar
        year={year || '4'}
        selectedGroup={selectedGroup}
        selectedSpecialty={selectedSpecialty}
        onGroupSelect={handleGroupSelect}
        onSpecialtySelect={handleSpecialtySelect}
      />
      <SearchHeader onSignInClick={handleSignIn} />

      <main className="pl-[280px] pt-[72px]">
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
          <Route path="/weekly/:weekId" element={<WeeklyResourcesPage year={year || '4'} />} />
          <Route path="/exams" element={<ExamListPage year={year || '4'} />} />
        </Routes>
      </main>
    </div>
  )
}

// Standalone case page without sidebar
function CasePageWrapper() {
  // Extract year from URL path since routes are /year3/cases/:caseId and /year4/cases/:caseId
  const location = useLocation()
  const year = location.pathname.includes('/year3') ? '3' : '4'
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin')

  const handleSignIn = () => {
    setAuthModalMode('signin')
    setShowAuthModal(true)
  }

  const handleCreateAccount = () => {
    setAuthModalMode('signup')
    setShowAuthModal(true)
  }

  return (
    <>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authModalMode} />
      <UnsavedChangesModal onSignIn={handleSignIn} onCreateAccount={handleCreateAccount} />
      <CasePage year={year} />
    </>
  )
}

// Standalone SAQ exam page without sidebar
function SAQExamPageWrapper() {
  const location = useLocation()
  const year = location.pathname.includes('/year3') ? '3' : '4'
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin')

  const handleSignIn = () => {
    setAuthModalMode('signin')
    setShowAuthModal(true)
  }

  const handleCreateAccount = () => {
    setAuthModalMode('signup')
    setShowAuthModal(true)
  }

  return (
    <>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authModalMode} />
      <UnsavedChangesModal onSignIn={handleSignIn} onCreateAccount={handleCreateAccount} />
      <SAQExamPage year={year} />
    </>
  )
}

// Standalone MCQ exam page without sidebar
function MCQExamPageWrapper() {
  const location = useLocation()
  const year = location.pathname.includes('/year3') ? '3' : '4'
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin')

  const handleSignIn = () => {
    setAuthModalMode('signin')
    setShowAuthModal(true)
  }

  const handleCreateAccount = () => {
    setAuthModalMode('signup')
    setShowAuthModal(true)
  }

  return (
    <>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authModalMode} />
      <UnsavedChangesModal onSignIn={handleSignIn} onCreateAccount={handleCreateAccount} />
      <MCQExamPage year={year} />
    </>
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
              <UnsavedChangesProvider>
                <ErrorBoundary>
                  <ProgressProvider>
                    <ErrorBoundary>
                      <TextMarkupProvider>
                        <ErrorBoundary>
                          <AnnotationsProvider>
                            <ErrorBoundary>
                              <LONotesProvider>
                                <ErrorBoundary>
                                  <SearchProvider caseData={caseData}>
                                    <BrowserRouter>
                                      <ErrorBoundary>
                                        <Routes>
                                          <Route path="/" element={<WelcomePage />} />
                                          {/* Case pages render without sidebar */}
                                          <Route path="/year3/cases/:caseId" element={<CasePageWrapper />} />
                                          <Route path="/year4/cases/:caseId" element={<CasePageWrapper />} />
                                          {/* Exam pages render without sidebar */}
                                          <Route path="/year3/exams/saq/:examId" element={<SAQExamPageWrapper />} />
                                          <Route path="/year4/exams/saq/:examId" element={<SAQExamPageWrapper />} />
                                          <Route path="/year3/exams/mcq/:examId" element={<MCQExamPageWrapper />} />
                                          <Route path="/year4/exams/mcq/:examId" element={<MCQExamPageWrapper />} />
                                          {/* List pages render with sidebar */}
                                          <Route path="/year3/*" element={<YearListLayout />} />
                                          <Route path="/year4/*" element={<YearListLayout />} />
                                          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                                          <Route path="/data-deletion" element={<DataDeletionPage />} />
                                          <Route path="*" element={<Navigate to="/" replace />} />
                                        </Routes>
                                      </ErrorBoundary>
                                    </BrowserRouter>
                                  </SearchProvider>
                                </ErrorBoundary>
                              </LONotesProvider>
                            </ErrorBoundary>
                          </AnnotationsProvider>
                        </ErrorBoundary>
                      </TextMarkupProvider>
                    </ErrorBoundary>
                  </ProgressProvider>
                </ErrorBoundary>
              </UnsavedChangesProvider>
            </ErrorBoundary>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
