import { StrictMode } from 'react'
import { act, renderHook, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '../components/ui'
import TasksProvider from '../context/TasksProvider'
import useTasks from '../hooks/useTasks'
import { STORAGE_KEY } from '../utils/constants'
import { BACKUP_STORAGE_KEY, STORAGE_ERRORS } from '../utils/storage'

// StrictMode is on because the real app uses it, and it is where double-run bugs show up.
function Wrapper({ children }) {
  return (
    <StrictMode>
      <ToastProvider>
        <TasksProvider>{children}</TasksProvider>
      </ToastProvider>
    </StrictMode>
  )
}

const newTaskFields = {
  title: ' Write tests ',
  description: '',
  status: 'Backlog',
  priority: 'High',
  assignee: 'Sam',
  tags: ['qa'],
}

function renderTasks() {
  return renderHook(() => useTasks(), { wrapper: Wrapper })
}

beforeEach(function () {
  localStorage.clear()
})

afterEach(function () {
  vi.restoreAllMocks()
})

describe('TasksProvider', function () {
  it('starts empty and writes nothing when there is nothing to save', function () {
    const { result } = renderTasks()
    expect(result.current.tasks).toEqual([])
    expect(result.current.storageProblem).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('adds a task and saves it in the current schema', function () {
    const { result } = renderTasks()

    act(function () {
      result.current.addTask(newTaskFields)
    })

    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('Write tests')

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(saved.schemaVersion).toBe(2)
    expect(saved.tasks).toHaveLength(1)
  })

  it('moves and deletes tasks', function () {
    const { result } = renderTasks()

    act(function () {
      result.current.addTask(newTaskFields)
    })
    const taskId = result.current.tasks[0].id

    act(function () {
      result.current.moveTask(taskId, 'Done')
    })
    expect(result.current.tasks[0].status).toBe('Done')

    act(function () {
      result.current.deleteTask(taskId)
    })
    expect(result.current.tasks).toEqual([])
  })

  it('migrates old data once: saves the new format, backs up the old, shows one toast', function () {
    const original = JSON.stringify([{ id: 'a', title: 'Old task', done: true, createdAt: 1700000000000 }])
    localStorage.setItem(STORAGE_KEY, original)

    const { result } = renderTasks()

    expect(result.current.tasks[0].status).toBe('Done')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).schemaVersion).toBe(2)
    expect(localStorage.getItem(BACKUP_STORAGE_KEY)).toBe(original)
    expect(screen.getAllByText('Your tasks were upgraded to the new format.')).toHaveLength(1)
  })

  it('leaves unreadable data alone until the user changes something', function () {
    localStorage.setItem(STORAGE_KEY, '{oops')

    const { result } = renderTasks()
    expect(result.current.storageProblem).toBe(STORAGE_ERRORS.UNREADABLE)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{oops')

    act(function () {
      result.current.addTask(newTaskFields)
    })

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).tasks).toHaveLength(1)
    expect(localStorage.getItem(BACKUP_STORAGE_KEY)).toBe('{oops')
    expect(result.current.storageProblem).toBe(STORAGE_ERRORS.UNREADABLE)
  })

  it('reports a failed save but keeps the task in memory', function () {
    const { result } = renderTasks()

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function () {
      throw new Error('quota exceeded')
    })

    act(function () {
      result.current.addTask(newTaskFields)
    })

    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.storageProblem).toBe(STORAGE_ERRORS.SAVE_FAILED)
  })

  it('can dismiss the storage problem', function () {
    localStorage.setItem(STORAGE_KEY, '{oops')
    const { result } = renderTasks()

    act(function () {
      result.current.dismissStorageProblem()
    })

    expect(result.current.storageProblem).toBeNull()
  })
})