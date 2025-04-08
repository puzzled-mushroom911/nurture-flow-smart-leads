import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SearchResult {
  content: string
  title: string
  score: number
}

interface DocumentSearchProps {
  onResultSelect?: (result: SearchResult) => void
}

export function DocumentSearch({ onResultSelect }: DocumentSearchProps) {
  const [query, setQuery] = useState('')

  const searchMutation = useMutation<SearchResult[], Error, string>({
    mutationFn: async (searchQuery: string) => {
      const response = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      return response.json()
    }
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      searchMutation.mutate(query)
    }
  }

  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query) return text

    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, i) => 
      regex.test(part) ? (
        <span key={i} className="bg-yellow-100 text-yellow-900">
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex space-x-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your knowledge base..."
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={searchMutation.isPending || !query.trim()}
        >
          {searchMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </form>

      {searchMutation.data && searchMutation.data.length > 0 && (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {searchMutation.data.map((result, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => onResultSelect?.(result)}
              >
                <CardContent className="p-4">
                  <h4 className="font-medium mb-1">{result.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {highlightMatch(result.content, query)}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Relevance: {Math.round(result.score * 100)}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {searchMutation.data && searchMutation.data.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No results found for "{query}"
        </p>
      )}

      {searchMutation.isError && (
        <p className="text-sm text-destructive">
          Failed to search documents. Please try again.
        </p>
      )}
    </div>
  )
} 