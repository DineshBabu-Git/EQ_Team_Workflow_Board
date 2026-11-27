import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY } from '../utils/constants'
import { renderBoard, seedSampleTasks } from './renderBoard'

beforeEach(function () {
  localStorage.clear()
})

describe('creating a task', function () {
  it('validates the form, saves the task, and shows the card in the chosen column', async function () {
    const user = userEvent.setup()
    renderBoard()

    // Start from the empty board.
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Create your first task' }))

    const dialog = screen.getByRole('dialog', { name: 'New task' })
    const titleInput = within(dialog).getByLabelText(/title/i)
    const assigneeInput = within(dialog).getByLabelText(/assignee/i)
    expect(titleInput).toHaveFocus()

    // Submitting the empty form shows both errors and focuses the first invalid field.
    await user.click(within(dialog).getByRole('button', { name: 'Create task' }))
    expect(within(dialog).getByText('Title is required.')).toBeInTheDocument()
    expect(within(dialog).getByText('Assignee is required.')).toBeInTheDocument()
    expect(titleInput).toHaveAttribute('aria-invalid', 'true')
    expect(titleInput).toHaveAccessibleDescription('Title is required.')
    expect(titleInput).toHaveFocus()

    // Fixing a field clears its error right away; the next submit jumps to the next bad field.
    await user.type(titleInput, 'Write release notes')
    expect(within(dialog).queryByText('Title is required.')).not.toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Create task' }))
    expect(assigneeInput).toHaveFocus()

    // Fill in the rest and save.
    await user.type(assigneeInput, 'Priya')
    await user.selectOptions(within(dialog).getByLabelText('Status'), 'In Progress')
    await user.selectOptions(within(dialog).getByLabelText('Priority'), 'High')
    await user.type(within(dialog).getByLabelText('Tags'), 'bug, UI, bug')
    await user.click(within(dialog).getByRole('button', { name: 'Create task' }))

    // The dialog closes, a toast appears, and the card is in the right column.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Task created')).toBeInTheDocument()

    const inProgress = screen.getByRole('region', { name: 'In Progress' })
    expect(within(inProgress).getByText('Write release notes')).toBeInTheDocument()
    expect(within(inProgress).getByText('Assignee: Priya')).toBeInTheDocument()
    expect(within(inProgress).getByText('High priority')).toBeInTheDocument()

    // Duplicate tags were removed, and the original spelling was kept.
    const tagList = within(inProgress).getByRole('list', { name: 'Tags' })
    const tagTexts = within(tagList)
      .getAllByRole('listitem')
      .map((item) => item.textContent)
    expect(tagTexts).toEqual(['bug', 'UI'])

    expect(within(screen.getByRole('region', { name: 'Backlog' })).getByText('No tasks here')).toBeInTheDocument()

    // And it was saved in the current storage format.
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(saved.schemaVersion).toBe(2)
    expect(saved.tasks).toHaveLength(1)
    expect(saved.tasks[0]).toMatchObject({
      title: 'Write release notes',
      assignee: 'Priya',
      priority: 'High',
      status: 'In Progress',
      tags: ['bug', 'UI'],
    })
  })
})

describe('leaving the form with unsaved changes', function () {
  it('closes an untouched form silently, and asks before discarding real changes', async function () {
    const user = userEvent.setup()
    seedSampleTasks()
    renderBoard()

    const newTaskButton = screen.getByRole('button', { name: 'New task' })

    // Untouched: Esc closes with no prompt.
    await user.click(newTaskButton)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Changed: Esc asks first.
    await user.click(newTaskButton)
    const formDialog = screen.getByRole('dialog', { name: 'New task' })
    await user.type(within(formDialog).getByLabelText(/title/i), 'Half written')
    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog', { name: 'Discard changes?' })).toBeInTheDocument()

    // "Keep editing" returns to the form with the text intact.
    await user.click(screen.getByRole('button', { name: 'Keep editing' }))
    expect(screen.queryByRole('dialog', { name: 'Discard changes?' })).not.toBeInTheDocument()
    expect(within(formDialog).getByLabelText(/title/i)).toHaveValue('Half written')

    // "Discard changes" closes everything and gives focus back to the button that opened it.
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Discard changes' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(newTaskButton).toHaveFocus()
  })
})