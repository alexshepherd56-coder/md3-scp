import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface ThemeContextType {
  isDark: boolean
  toggleDark: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('darkMode')
    return stored === 'true'
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', String(isDark))
  }, [isDark])

  const toggleDark = () => setIsDark((prev) => !prev)

  const value = {
    isDark,
    toggleDark,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
