import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getRelativeTime } from '../utils/relativeTime'
import { renderBoard, seedSampleTasks } from './renderBoard'

// TaskCard calls getRelativeTime exactly once each time it renders, so counting calls to it
// counts card renders. This wraps the real function in a spy and does not change its behavior.
// (It does tie the test to that one line in TaskCard. If you ever remove the call, update the test.)
vi.mock('../utils/relativeTime', async function (importOriginal) {
  const actual = await importOriginal()
  return { ...actual, getRelativeTime: vi.fn(actual.getRelativeTime) }
})

beforeEach(function () {
  localStorage.clear()
  seedSampleTasks()
})

describe('TaskCard re-renders', function () {
  it('does not re-render any card when only a dialog opens', async function () {
    const user = userEvent.setup()
    renderBoard()
    vi.mocked(getRelativeTime).mockClear()

    // Opening the dialog changes TaskBoard's state, but not the tasks or the filters.
    await user.click(screen.getByRole('button', { name: 'New task' }))

    expect(screen.getByRole('dialog', { name: 'New task' })).toBeInTheDocument()
    expect(getRelativeTime).not.toHaveBeenCalled()
  })

  it('re-renders only the card that changed when a task is moved', async function () {
    const user = userEvent.setup()
    renderBoard()
    vi.mocked(getRelativeTime).mockClear()

    await user.selectOptions(screen.getByLabelText('Status of Set up CI'), 'Done')

    // One card of four was re-rendered (it now sits in a different column).
    expect(getRelativeTime).toHaveBeenCalledTimes(1)
  })
})