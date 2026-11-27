import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY } from '../utils/constants'
import { renderBoard, seedSampleTasks } from './renderBoard'

beforeEach(function () {
  localStorage.clear()
  seedSampleTasks()
})

// The card titles of one column, in the order they appear on screen.
function getTitlesIn(region) {
  return within(region)
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent)
}

describe('moving a task', function () {
  it('moves the card to the new column, saves it, and keeps keyboard focus on its select', async function () {
    const user = userEvent.setup()
    renderBoard()

    const backlog = screen.getByRole('region', { name: 'Backlog' })
    expect(within(backlog).getByText('Set up CI')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Status of Set up CI'), 'Done')

    const done = screen.getByRole('region', { name: 'Done' })
    expect(within(done).getByText('Set up CI')).toBeInTheDocument()
    expect(within(backlog).queryByText('Set up CI')).not.toBeInTheDocument()
    expect(within(done).getByText('just now')).toBeInTheDocument()
    expect(screen.getByLabelText('Status of Set up CI')).toHaveFocus()

    const savedTask = JSON.parse(localStorage.getItem(STORAGE_KEY)).tasks.find((task) => task.id === 'demo-4')
    expect(savedTask.status).toBe('Done')
  })
})

describe('filtering and sorting', function () {
  it('filters by priority and writes the choice to the URL', async function () {
    const user = userEvent.setup()
    renderBoard()

    await user.selectOptions(screen.getByLabelText('Priority'), 'High')

    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
    expect(screen.queryByText('Write onboarding docs')).not.toBeInTheDocument()
    expect(screen.queryByText('Set up CI')).not.toBeInTheDocument()
    expect(screen.getByText('Showing 1 of 4 tasks')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/?priority=High')
  })

  it('restores filters from the URL on the first render', function () {
    renderBoard('/?status=Done')

    expect(screen.getByRole('checkbox', { name: 'Done' })).toBeChecked()
    expect(screen.getByText('Design the board layout')).toBeInTheDocument()
    expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument()
    expect(screen.getByText('Showing 1 of 4 tasks')).toBeInTheDocument()
  })

  it('sorts by priority and reorders the cards inside a column', async function () {
    const user = userEvent.setup()
    renderBoard()

    const backlog = screen.getByRole('region', { name: 'Backlog' })
    // Default sort is updated date, newest first.
    expect(getTitlesIn(backlog)).toEqual(['Set up CI', 'Write onboarding docs'])

    await user.selectOptions(screen.getByLabelText('Sort by'), 'priority')
    await user.selectOptions(screen.getByLabelText('Order'), 'Low to High')

    expect(getTitlesIn(backlog)).toEqual(['Write onboarding docs', 'Set up CI'])
    expect(screen.getByTestId('location')).toHaveTextContent('/?sort=priority&dir=asc')
  })

  it('searches titles and descriptions', async function () {
    const user = userEvent.setup()
    renderBoard()

    // "sign in" only appears in the description of "Fix login bug".
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'sign in')

    // The search is applied to the URL after a short pause, so wait for it.
    expect(await screen.findByText('Showing 1 of 4 tasks')).toBeInTheDocument()
    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
    expect(screen.queryByText('Set up CI')).not.toBeInTheDocument()
  })

  it('shows the empty state when nothing matches, and Clear filters brings everything back', async function () {
    const user = userEvent.setup()
    renderBoard()

    const searchBox = screen.getByRole('searchbox', { name: 'Search' })
    await user.type(searchBox, 'zzz')

    const emptyHeading = await screen.findByText('No tasks match your filters')
    expect(screen.getByText('Showing 0 of 4 tasks')).toBeInTheDocument()

    // Two "Clear filters" buttons exist now, so pick the one inside the empty state.
    await user.click(within(emptyHeading.parentElement).getByRole('button', { name: 'Clear filters' }))

    expect(screen.getByText('Showing 4 of 4 tasks')).toBeInTheDocument()
    expect(searchBox).toHaveValue('')
    expect(searchBox).toHaveFocus()
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })

  it('does not bring back a search typed just before Clear filters was pressed', async function () {
    const user = userEvent.setup()
    renderBoard()

    await user.selectOptions(screen.getByLabelText('Priority'), 'Low')
    const searchBox = screen.getByRole('searchbox', { name: 'Search' })
    await user.type(searchBox, 'x')
    // Pressed well inside the 300 ms search delay, so the "x" search is still waiting on its timer.
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    // Wait longer than the delay. If the timer were not cancelled, it would fire now.
    await new Promise((resolve) => setTimeout(resolve, 500))

    expect(searchBox).toHaveValue('')
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })
})