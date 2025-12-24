import { createContext, useContext, useState, type ReactNode, useMemo } from 'react'
import Fuse from 'fuse.js'
import type { CaseMetadata } from '@/types/case'

interface SearchResult extends CaseMetadata {
  score: number
}

interface SearchContextType {
  query: string
  results: SearchResult[]
  search: (query: string) => void
  clearSearch: () => void
  isSearching: boolean
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

interface SearchProviderProps {
  children: ReactNode
  caseData: CaseMetadata[]
}

export function SearchProvider({ children, caseData }: SearchProviderProps) {
  const [query, setQuery] = useState('')

  // Initialize Fuse.js fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(caseData, {
      keys: ['title', 'category', 'discipline', 'setting'],
      threshold: 0.3,
      includeScore: true,
    })
  }, [caseData])

  const results = useMemo(() => {
    if (!query.trim()) return []

    return fuse.search(query).map((result) => ({
      ...result.item,
      score: result.score || 0,
    }))
  }, [query, fuse])

  const search = (newQuery: string) => setQuery(newQuery)
  const clearSearch = () => setQuery('')

  const value = {
    query,
    results,
    search,
    clearSearch,
    isSearching: query.trim().length > 0,
  }

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return context
}
