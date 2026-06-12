'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { autocompleteServers } from '@/app/actions/autocomplete'

export interface SearchResult {
  id: string; name: string; owner: string; repo: string
  description: string; stars: number; category: string
}

function calcDropdownPos(el: HTMLElement, count: number) {
  const rect = el.getBoundingClientRect(), estH = Math.min(count, 8) * 42 + 40
  const vh = window.innerHeight, below = vh - rect.bottom - 8, above = rect.top - 8
  let top = (below >= estH || below >= above) ? rect.bottom + 8 : rect.top - estH - 8
  return { top: Math.max(8, Math.min(top, vh - estH - 8)), left: rect.left, width: rect.width }
}

export function useAutocompleteSearch(locale: string, defaultValue = '') {
  const [query, setQuery] = useState(defaultValue)
  const [results, setResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const debouncedSearch = useCallback(async (v: string) => {
    if (v.length < 2) { setResults([]); return }
    setLoading(true); setResults(await autocompleteServers(v)); setLoading(false)
  }, [])

  useEffect(() => { const t = setTimeout(() => debouncedSearch(query), 200); return () => clearTimeout(t) }, [query, debouncedSearch])

  const updatePos = useCallback(() => { if (inputRef.current) setDropdownPos(calcDropdownPos(inputRef.current, results.length)) }, [results])

  useEffect(() => {
    if (!(showDropdown && results.length > 0)) return
    updatePos(); window.addEventListener('scroll', updatePos, true); window.addEventListener('resize', updatePos)
    return () => { window.removeEventListener('scroll', updatePos, true); window.removeEventListener('resize', updatePos) }
  }, [showDropdown, results, updatePos])

  useEffect(() => {
    const h = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node) && !(e.target as Element).closest?.('[data-autocomplete-dropdown]')) setShowDropdown(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])

  const go = useCallback((url: string) => { router.push(url); setShowDropdown(false) }, [router])
  const navigateToResult = useCallback((r: SearchResult) => { go(`/${locale}/servers/${r.owner}/${r.repo}`); setQuery('') }, [locale, go])
  const searchAll = useCallback(() => { if (query) go(`/${locale}/all?q=${encodeURIComponent(query)}`) }, [query, locale, go])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, -1)) }
    else if (e.key === 'Enter') { e.preventDefault(); selectedIndex >= 0 ? navigateToResult(results[selectedIndex]) : searchAll() }
    else if (e.key === 'Escape') { setShowDropdown(false); inputRef.current?.blur() }
  }, [results, selectedIndex, navigateToResult, searchAll])

  const handleSubmit = useCallback((e: React.FormEvent) => { e.preventDefault(); searchAll() }, [searchAll])
  const clearQuery = useCallback(() => { setQuery(''); setResults([]); setShowDropdown(false); inputRef.current?.focus() }, [])
  const onInputChange = useCallback((v: string) => { setQuery(v); setShowDropdown(true); setSelectedIndex(-1) }, [])
  const onInputFocus = useCallback(() => { if (query.length >= 2) { updatePos(); setShowDropdown(true) } }, [query, updatePos])

  return { query, results, showDropdown, loading, selectedIndex, dropdownPos, inputRef, containerRef, handleKeyDown, handleSubmit, clearQuery, onInputChange, onInputFocus, navigateToResult, setSelectedIndex }
}
