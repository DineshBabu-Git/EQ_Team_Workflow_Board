// Shared by the integration tests. Renders the real board inside the real providers,
// with a router that keeps the URL in memory. LocationDisplay prints the current URL
// so tests can check what the filters wrote to the query string.
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../components/ui'
import TasksProvider from '../context/TasksProvider'
import TaskBoard from '../features/tasks/TaskBoard'
import { STORAGE_KEY } from '../utils/constants'
import { createV2SampleData } from '../utils/devSeed'
import LocationDisplay from './LocationDisplay'

// Four tasks: "Fix login bug" (In Progress, High), "Write onboarding docs" (Backlog, Low),
// "Design the board layout" (Done, Medium), "Set up CI" (Backlog, Medium).
export function seedSampleTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(createV2SampleData()))
}

export function renderBoard(startingUrl = '/') {
  return render(
    <MemoryRouter initialEntries={[startingUrl]}>
      <ToastProvider>
        <TasksProvider>
          <TaskBoard />
          <LocationDisplay />
        </TasksProvider>
      </ToastProvider>
    </MemoryRouter>,
  )
}