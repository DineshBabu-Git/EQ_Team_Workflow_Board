import { ToastProvider } from './components/ui'
import TasksProvider from './context/TasksProvider'
import TaskBoard from './features/tasks/TaskBoard'
import DevTools from './features/tasks/DevTools'

// ToastProvider must be outside TasksProvider because the tasks provider shows a toast.
function App() {
  return (
    <ToastProvider>
      <TasksProvider>
        <div className="min-h-screen bg-slate-50">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-6xl px-4 py-4">
              <h1 className="text-2xl font-bold text-slate-900">Team Workflow Board</h1>
            </div>
          </header>
          <main>
            <TaskBoard />
          </main>
          {import.meta.env.DEV && (
            <footer className="mx-auto max-w-6xl px-4 pb-8">
              <DevTools />
            </footer>
          )}
        </div>
      </TasksProvider>
    </ToastProvider>
  )
}

export default App