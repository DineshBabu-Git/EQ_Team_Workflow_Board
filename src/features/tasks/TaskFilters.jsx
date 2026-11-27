// Props: filters (from useTaskFilters), hasActiveFilters, and the change functions:
// onToggleStatus, onPriorityChange, onSearchChange, onSortFieldChange,
// onSortDirectionChange, onClear.
// Purely presentational except for the search box, which keeps its own text so typing is
// never delayed or reverted, and tells the URL about it after a short pause.
import { useEffect, useRef, useState } from 'react'
import { Button, Select, TextInput } from '../../components/ui'
import { PRIORITIES, SORT_FIELDS, SORT_FIELD_LABELS } from '../../utils/constants'
import StatusFilter from './StatusFilter'

const SEARCH_DELAY_MS = 300

const sortFieldOptions = SORT_FIELDS.map(function (field) {
  return { value: field, label: SORT_FIELD_LABELS[field] }
})

// "Newest first" makes no sense for priority, so the wording follows the sort field.
function getDirectionOptions(sortField) {
  if (sortField === 'priority') {
    return [
      { value: 'desc', label: 'High to Low' },
      { value: 'asc', label: 'Low to High' },
    ]
  }
  return [
    { value: 'desc', label: 'Newest first' },
    { value: 'asc', label: 'Oldest first' },
  ]
}

function TaskFilters({
  filters,
  hasActiveFilters,
  onToggleStatus,
  onPriorityChange,
  onSearchChange,
  onSortFieldChange,
  onSortDirectionChange,
  onClear,
}) {
  const [searchInput, setSearchInput] = useState(filters.searchText)
  const [lastUrlSearchText, setLastUrlSearchText] = useState(filters.searchText)
  const searchTimerRef = useRef(null)

  // When the URL's search text changes by itself (Back button, a shared link, Clear),
  // copy it into the box. Setting state while rendering is the documented way to do this,
  // and React re-renders straight away without showing the old text.
  if (filters.searchText !== lastUrlSearchText) {
    setLastUrlSearchText(filters.searchText)
    setSearchInput(filters.searchText)
  }

  // Do not run the pending URL update if the filters are unmounted.
  useEffect(function () {
    return function cancelPendingSearch() {
      clearTimeout(searchTimerRef.current)
    }
  }, [])

  function handleSearchInputChange(event) {
    const newText = event.target.value
    setSearchInput(newText)

    // Restart the timer on every keystroke; only the pause after the last one counts.
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(function () {
      onSearchChange(newText)
    }, SEARCH_DELAY_MS)
  }

  function handleClearClick() {
    clearTimeout(searchTimerRef.current)
    setSearchInput('')
    onClear()
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TextInput
          id="filter-search"
          type="search"
          label="Search"
          placeholder="Title or description"
          value={searchInput}
          onChange={handleSearchInputChange}
        />
        <Select
          id="filter-priority"
          label="Priority"
          options={PRIORITIES}
          emptyOptionLabel="All priorities"
          value={filters.priority}
          onChange={function (event) {
            onPriorityChange(event.target.value)
          }}
        />
        <Select
          id="sort-field"
          label="Sort by"
          options={sortFieldOptions}
          value={filters.sortField}
          onChange={function (event) {
            onSortFieldChange(event.target.value)
          }}
        />
        <Select
          id="sort-direction"
          label="Order"
          options={getDirectionOptions(filters.sortField)}
          value={filters.sortDirection}
          onChange={function (event) {
            onSortDirectionChange(event.target.value)
          }}
        />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <StatusFilter selectedStatuses={filters.statuses} onToggle={onToggleStatus} />
        <Button variant="secondary" size="sm" onClick={handleClearClick} disabled={!hasActiveFilters}>
          Clear filters
        </Button>
      </div>
    </div>
  )
}

export default TaskFilters