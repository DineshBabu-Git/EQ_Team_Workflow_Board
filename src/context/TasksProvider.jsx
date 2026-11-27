// Wrap the app in <TasksProvider> (inside <ToastProvider>, because it shows a toast).
// Components then call useTasks() to get:
//   tasks, storageProblem, addTask(fields), updateTask(id, fields), moveTask(id, status),
//   deleteTask(id), dismissStorageProblem()
// It loads once, saves right after every change, and keeps running in memory if storage fails.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '../components/ui'
import { getNextStorageProblem, loadTasks, saveTasks } from '../utils/storage'
import { cleanTaskFields, createTask } from '../utils/taskFactory'
import { TasksContext } from './tasksContext'
import { ACTION_TYPES, tasksReducer } from './tasksReducer'

function TasksProvider({ children }) {
  const { showToast } = useToast()

  // Passing the function (not calling it) makes React run loadTasks once and keep the
  // whole { tasks, migrated, error } result for later.
  const [initialLoad] = useState(loadTasks)
  const [tasks, setTasks] = useState(initialLoad.tasks)

  // Always holds the newest list, so a handler can compute the next list and save it
  // without waiting for a re-render. It is only read inside handlers, never while rendering.
  const tasksRef = useRef(initialLoad.tasks)

  const [storageProblem, setStorageProblem] = useState(function () {
    // Finish a pending migration by writing the new format right away. Writing the same
    // data twice (StrictMode runs this twice in dev) is harmless. Unreadable data is
    // never written here, so it stays untouched until the user changes something.
    if (initialLoad.migrated) {
      const result = saveTasks(initialLoad.tasks)
      return getNextStorageProblem(initialLoad.error, result.ok)
    }
    return initialLoad.error
  })

  // A ref survives StrictMode's simulated remount, so the toast is only shown once.
  const hasAnnouncedMigrationRef = useRef(false)

  useEffect(
    function announceMigration() {
      if (initialLoad.migrated && !hasAnnouncedMigrationRef.current) {
        hasAnnouncedMigrationRef.current = true
        showToast('Your tasks were upgraded to the new format.', 'info')
      }
    },
    [initialLoad.migrated, showToast],
  )

  // Every change goes through here: work out the new list, show it, then save it.
  // The reducer is still a plain pure function, we just call it ourselves.
  const applyAction = useCallback(function (action) {
    const currentTasks = tasksRef.current
    const nextTasks = tasksReducer(currentTasks, action)

    // Nothing changed (for example moving a task to the column it is already in).
    if (nextTasks === currentTasks) {
      return
    }

    tasksRef.current = nextTasks
    setTasks(nextTasks)

    const result = saveTasks(nextTasks)
    setStorageProblem(function (currentProblem) {
      return getNextStorageProblem(currentProblem, result.ok)
    })
  }, [])

  // useCallback keeps these functions identical between renders. TaskCard can then be
  // wrapped in React.memo in Stage 9 and actually skip re-renders.
  const addTask = useCallback(
    function (fields) {
      applyAction({ type: ACTION_TYPES.ADD, task: createTask(fields) })
    },
    [applyAction],
  )

  const updateTask = useCallback(
    function (id, fields) {
      applyAction({
        type: ACTION_TYPES.UPDATE,
        id,
        changes: cleanTaskFields(fields),
        updatedAt: new Date().toISOString(),
      })
    },
    [applyAction],
  )

  const moveTask = useCallback(
    function (id, newStatus) {
      applyAction({
        type: ACTION_TYPES.MOVE,
        id,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      })
    },
    [applyAction],
  )

  const deleteTask = useCallback(
    function (id) {
      applyAction({ type: ACTION_TYPES.DELETE, id })
    },
    [applyAction],
  )

  const dismissStorageProblem = useCallback(function () {
    setStorageProblem(null)
  }, [])

  // Without useMemo this object would be new on every render and re-render every consumer.
  const contextValue = useMemo(
    function () {
      return { tasks, storageProblem, addTask, updateTask, moveTask, deleteTask, dismissStorageProblem }
    },
    [tasks, storageProblem, addTask, updateTask, moveTask, deleteTask, dismissStorageProblem],
  )

  return <TasksContext.Provider value={contextValue}>{children}</TasksContext.Provider>
}

export default TasksProvider