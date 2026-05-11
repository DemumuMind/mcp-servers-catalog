import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '@/components/theme-toggle'

// Mock the theme hook
vi.mock('@/components/theme-provider', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    resolvedTheme: 'light',
  }),
}))

describe('ThemeToggle', () => {
  it('renders three theme buttons', () => {
    render(<ThemeToggle />)
    expect(screen.getByTitle('Светлая тема')).toBeInTheDocument()
    expect(screen.getByTitle('Системная тема')).toBeInTheDocument()
    expect(screen.getByTitle('Тёмная тема')).toBeInTheDocument()
  })
})
