import { createContext, useContext, useState, type ReactNode, useMemo, useEffect } from 'react'
import FlexSearch from 'flexsearch'
import type { CaseMetadata } from '@/types/case'
import searchData from '@/data/searchIndex.json'

interface SearchableCase {
  id: string
  title: string
  category: string
  discipline: string
  setting: string
  content: string
  [key: string]: string // Index signature for FlexSearch compatibility
}

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
  const [searchResults, setSearchResults] = useState<string[]>([])

  // Initialize FlexSearch Document index
  const index = useMemo(() => {
    const idx = new FlexSearch.Document<SearchableCase>({
      document: {
        id: 'id',
        index: ['title', 'category', 'discipline', 'setting', 'content'],
      },
      tokenize: 'forward',
      resolution: 9,
      cache: true,
    })

    // Add all searchable cases to the index
    for (const caseItem of searchData as SearchableCase[]) {
      idx.add(caseItem)
    }

    return idx
  }, [])

  // Perform search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    // Search across all indexed fields
    const results = index.search(query, {
      limit: 50,
      enrich: true,
    })

    // Collect unique IDs from all field results
    const idSet = new Set<string>()
    for (const fieldResult of results) {
      if (fieldResult.result) {
        for (const item of fieldResult.result) {
          // Handle both enriched and non-enriched results
          const id = typeof item === 'object' && item !== null && 'id' in item
            ? String(item.id)
            : String(item)
          idSet.add(id)
        }
      }
    }

    setSearchResults(Array.from(idSet))
  }, [query, index])

  // Map search results to case metadata
  const results = useMemo(() => {
    if (!query.trim()) return []

    return searchResults
      .map((id, idx) => {
        const caseMetadata = caseData.find(c => c.id === id)
        if (!caseMetadata) return null
        return {
          ...caseMetadata,
          score: 1 - (idx / searchResults.length), // Higher score for earlier results
        }
      })
      .filter((r): r is SearchResult => r !== null)
  }, [searchResults, caseData, query])

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
