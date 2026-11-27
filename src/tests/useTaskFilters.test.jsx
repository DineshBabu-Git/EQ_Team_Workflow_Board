import { act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import useTaskFilters from '../hooks/useTaskFilters'

// MemoryRouter is a router that keeps the URL in memory, which is what tests need.
function renderFilters(startingUrl = '/') {
  function Wrapper({ children }) {
    return <MemoryRouter initialEntries={[startingUrl]}>{children}</MemoryRouter>
  }
  return renderHook(() => useTaskFilters(), { wrapper: Wrapper })
}

describe('useTaskFilters', function () {
  it('reads the starting filters from the URL', function () {
    const { result } = renderFilters('/?status=Done&priority=Low&q=docs&sort=created&dir=asc')
    expect(result.current.filters).toEqual({
      statuses: ['Done'],
      priority: 'Low',
      searchText: 'docs',
      sortField: 'created',
      sortDirection: 'asc',
    })
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('toggles statuses on and off, in the standard order', function () {
    const { result } = renderFilters()

    act(function () {
      result.current.toggleStatus('Done')
    })
    act(function () {
      result.current.toggleStatus('Backlog')
    })
    expect(result.current.filters.statuses).toEqual(['Backlog', 'Done'])

    act(function () {
      result.current.toggleStatus('Done')
    })
    expect(result.current.filters.statuses).toEqual(['Backlog'])
  })

  it('keeps other filters when one changes', function () {
    const { result } = renderFilters('/?priority=High')

    act(function () {
      result.current.setSearchText('login')
    })

    expect(result.current.filters.priority).toBe('High')
    expect(result.current.filters.searchText).toBe('login')
  })

  it('changes the sort without counting it as an active filter', function () {
    const { result } = renderFilters()

    act(function () {
      result.current.setSortField('priority')
    })
    act(function () {
      result.current.setSortDirection('asc')
    })

    expect(result.current.filters.sortField).toBe('priority')
    expect(result.current.filters.sortDirection).toBe('asc')
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('clears filters but keeps the sort', function () {
    const { result } = renderFilters('/?status=Done&priority=High&q=x&sort=created&dir=asc')

    act(function () {
      result.current.clearFilters()
    })

    expect(result.current.filters).toEqual({
      statuses: [],
      priority: '',
      searchText: '',
      sortField: 'created',
      sortDirection: 'asc',
    })
    expect(result.current.hasActiveFilters).toBe(false)
  })
})