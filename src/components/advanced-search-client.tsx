'use client'

import { useState, useCallback, useEffect } from 'react'
import { advancedSearchServers } from '@/app/actions/advanced-search'
import { ServerCard } from '@/components/server-card'
import { AutocompleteSearch } from '@/components/autocomplete-search'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Filter, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AdvancedSearchPageProps {
  categories: string[]
  languages: string[]
  locale: string
}

interface FilterState {
  selectedCategories: string[]
  selectedLanguages: string[]
  minStars: string
  maxStars: string
  minRating: string
  onlyRemote: boolean
  onlyOfficial: boolean
  hasEndpoint: boolean
}

function SearchFiltersPanel({
  categories,
  languages,
  filters,
  onToggleCategory,
  onToggleLanguage,
  onSetMinStars,
  onSetMaxStars,
  onSetMinRating,
  onSetOnlyRemote,
  onSetOnlyOfficial,
  onSetHasEndpoint,
  onSearch,
  onReset,
  loading,
}: {
  categories: string[]
  languages: string[]
  filters: FilterState
  onToggleCategory: (cat: string) => void
  onToggleLanguage: (lang: string) => void
  onSetMinStars: (val: string) => void
  onSetMaxStars: (val: string) => void
  onSetMinRating: (val: string) => void
  onSetOnlyRemote: (val: boolean) => void
  onSetOnlyOfficial: (val: boolean) => void
  onSetHasEndpoint: (val: boolean) => void
  onSearch: () => void
  onReset: () => void
  loading: boolean
}) {
  const t = useTranslations('AdvancedSearch')
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Categories */}
        <div>
          <h3 className="text-sm font-medium mb-2">{t('categories')}</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onToggleCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  filters.selectedCategories.includes(cat)
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
            <Label htmlFor="minStars">{t('minStars')}</Label>
            <Input
              id="minStars"
              type="number"
              placeholder="0"
              value={filters.minStars}
              onChange={(e) => onSetMinStars(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="maxStars">{t('maxStars')}</Label>
            <Input
              id="maxStars"
              type="number"
              placeholder="∞"
              value={filters.maxStars}
              onChange={(e) => onSetMaxStars(e.target.value)}
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <Label htmlFor="minRating">{t('minRating')}</Label>
          <Input
            id="minRating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            placeholder="0"
            value={filters.minRating}
            onChange={(e) => onSetMinRating(e.target.value)}
          />
        </div>

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">{t('languages')}</h3>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => onToggleLanguage(lang)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.selectedLanguages.includes(lang)
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
              checked={filters.onlyRemote}
              onCheckedChange={(checked) => onSetOnlyRemote(checked as boolean)}
            />
            <Label htmlFor="remote">{t('onlyRemote')}</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="official"
              checked={filters.onlyOfficial}
              onCheckedChange={(checked) => onSetOnlyOfficial(checked as boolean)}
            />
            <Label htmlFor="official">{t('onlyOfficial')}</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="endpoint"
              checked={filters.hasEndpoint}
              onCheckedChange={(checked) => onSetHasEndpoint(checked as boolean)}
            />
            <Label htmlFor="endpoint">{t('hasEndpoint')}</Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={onSearch} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('search')}
          </Button>
          <Button variant="ghost" onClick={onReset}>
            <X className="w-4 h-4 mr-2" />
            {t('reset')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SearchResultsSection({
  servers,
  total,
  loading,
  locale,
}: {
  servers: any[]
  total: number
  loading: boolean
  locale: string
}) {
  const t = useTranslations('AdvancedSearch')
  if (servers.length > 0) {
    return (
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          {t('foundServers', { count: total })}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servers.map((server) => (
            <ServerCard key={`search-${server.id}`} server={server} locale={locale} />
          ))}
        </div>
      </div>
    )
  }

  if (!loading) {
    return (
      <p className="text-center text-muted-foreground py-12">
        {t('configureFilters')}
      </p>
    )
  }

  return null
}

export function AdvancedSearchClient({ categories, languages, locale }: AdvancedSearchPageProps) {
  const [loading, setLoading] = useState(false)
  const [servers, setServers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [minStars, setMinStars] = useState('')
  const [maxStars, setMaxStars] = useState('')
  const [minRating, setMinRating] = useState('')
  const [onlyRemote, setOnlyRemote] = useState(false)
  const [onlyOfficial, setOnlyOfficial] = useState(false)
  const [hasEndpoint, setHasEndpoint] = useState(false)
  const [searchQuery, _setSearchQuery] = useState('')
  const t = useTranslations('AdvancedSearch')

  const filters: FilterState = {
    selectedCategories,
    selectedLanguages,
    minStars,
    maxStars,
    minRating,
    onlyRemote,
    onlyOfficial,
    hasEndpoint,
  }

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

  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedLanguages([])
    setMinStars('')
    setMaxStars('')
    setMinRating('')
    setOnlyRemote(false)
    setOnlyOfficial(false)
    setHasEndpoint(false)
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
        {t('filters')}
        {(selectedCategories.length + selectedLanguages.length > 0 || onlyRemote || onlyOfficial) && (
          <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
            {selectedCategories.length + selectedLanguages.length + (onlyRemote ? 1 : 0) + (onlyOfficial ? 1 : 0)}
          </span>
        )}
      </Button>

      {showFilters && (
        <SearchFiltersPanel
          categories={categories}
          languages={languages}
          filters={filters}
          onToggleCategory={toggleCategory}
          onToggleLanguage={toggleLanguage}
          onSetMinStars={setMinStars}
          onSetMaxStars={setMaxStars}
          onSetMinRating={setMinRating}
          onSetOnlyRemote={setOnlyRemote}
          onSetOnlyOfficial={setOnlyOfficial}
          onSetHasEndpoint={setHasEndpoint}
          onSearch={performSearch}
          onReset={resetFilters}
          loading={loading}
        />
      )}

      <SearchResultsSection
        servers={servers}
        total={total}
        loading={loading}
        locale={locale}
      />
    </div>
  )
}
