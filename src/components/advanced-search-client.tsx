'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { advancedSearchServers } from '@/app/actions/advanced-search'
import { ServerCard } from '@/components/server-card'
import { AutocompleteSearch } from '@/components/autocomplete-search'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Filter, X } from 'lucide-react'

interface AdvancedSearchPageProps {
  categories: string[]
  languages: string[]
  locale: string
}

export function AdvancedSearchClient({ categories, languages, locale }: AdvancedSearchPageProps) {
  const [loading, setLoading] = useState(false)
  const [servers, setServers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [minStars, setMinStars] = useState('')
  const [maxStars, setMaxStars] = useState('')
  const [minRating, setMinRating] = useState('')
  const [onlyRemote, setOnlyRemote] = useState(false)
  const [onlyOfficial, setOnlyOfficial] = useState(false)
  const [hasEndpoint, setHasEndpoint] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const performSearch = useCallback(async () => {
    setLoading(true)
    try {
      const result = await advancedSearchServers({
        search: searchQuery || undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        minStars: minStars ? parseInt(minStars) : undefined,
        maxStars: maxStars ? parseInt(maxStars) : undefined,
        minRating: minRating ? parseFloat(minRating) : undefined,
        onlyRemote,
        onlyOfficial,
        hasEndpoint,
        languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
      })
      setServers(result.servers)
      setTotal(result.total)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [
    searchQuery,
    selectedCategories,
    selectedLanguages,
    minStars,
    maxStars,
    minRating,
    onlyRemote,
    onlyOfficial,
    hasEndpoint,
  ])

  // Load all servers on initial mount
  useEffect(() => {
    performSearch()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AutocompleteSearch locale={locale} defaultValue={searchQuery} />
      </div>

      <Button
        variant="outline"
        className="gap-2"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter className="w-4 h-4" />
        Фильтры
        {(selectedCategories.length + selectedLanguages.length > 0 || onlyRemote || onlyOfficial) && (
          <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
            {selectedCategories.length + selectedLanguages.length + (onlyRemote ? 1 : 0) + (onlyOfficial ? 1 : 0)}
          </span>
        )}
      </Button>

      {showFilters && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium mb-2">Категории</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedCategories.includes(cat)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Stars range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minStars">Мин. звёзд</Label>
                <Input
                  id="minStars"
                  type="number"
                  placeholder="0"
                  value={minStars}
                  onChange={(e) => setMinStars(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="maxStars">Макс. звёзд</Label>
                <Input
                  id="maxStars"
                  type="number"
                  placeholder="∞"
                  value={maxStars}
                  onChange={(e) => setMaxStars(e.target.value)}
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <Label htmlFor="minRating">Мин. рейтинг</Label>
              <Input
                id="minRating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="0"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              />
            </div>

            {/* Languages */}
            {languages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Языки</h3>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selectedLanguages.includes(lang)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Booleans */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remote"
                  checked={onlyRemote}
                  onCheckedChange={(checked) => setOnlyRemote(checked as boolean)}
                />
                <Label htmlFor="remote">Только remote (SSE/HTTP)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="official"
                  checked={onlyOfficial}
                  onCheckedChange={(checked) => setOnlyOfficial(checked as boolean)}
                />
                <Label htmlFor="official">Только официальные</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="endpoint"
                  checked={hasEndpoint}
                  onCheckedChange={(checked) => setHasEndpoint(checked as boolean)}
                />
                <Label htmlFor="endpoint">Есть endpoint</Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={performSearch} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Поиск
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedCategories([])
                  setSelectedLanguages([])
                  setMinStars('')
                  setMaxStars('')
                  setMinRating('')
                  setOnlyRemote(false)
                  setOnlyOfficial(false)
                  setHasEndpoint(false)
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Сбросить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {servers.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Найдено {total} серверов
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servers.map((server) => (
              <ServerCard key={server.id} server={server} locale={locale} />
            ))}
          </div>
        </div>
      )}

      {servers.length === 0 && !loading && (
        <p className="text-center text-muted-foreground py-12">
          Настройте фильтры и нажмите "Поиск"
        </p>
      )}
    </div>
  )
}
