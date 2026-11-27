
// Wrap the app in <TasksProvider> and It loads once, saves whenever tasks change, and keeps running in memory if storage fails.

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useToast } from '../components/ui'
import { STORAGE_ERRORS, loadTasks, saveTasks } from '../utils/storage'
import { cleanTaskFields, createTask } from '../utils/taskFactory'
import { TasksContext } from './tasksContext'
import { ACTION_TYPES, tasksReducer } from './tasksReducer'

function TasksProvider({ children }) {
  const { showToast } = useToast()

  // Passing the function (not calling it) makes React run loadTasks once and keep the
  // whole { tasks, migrated, error } result for later.
  const [initialLoad] = useState(loadTasks)
  const [tasks, dispatch] = useReducer(tasksReducer, initialLoad.tasks)
  const [storageProblem, setStorageProblem] = useState(initialLoad.error)

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

  useEffect(
    function saveWhenTasksChange() {
      // Nothing changed since loading, and nothing needs upgrading: do not write.
      // This keeps unreadable data untouched until the user actually changes something.
      const isUntouched = tasks === initialLoad.tasks
      if (isUntouched && !initialLoad.migrated) {
        return
      }

      const result = saveTasks(tasks)

      if (result.ok) {
        // A later successful save means an earlier "save failed" message is out of date.
        setStorageProblem(function (current) {
          return current === STORAGE_ERRORS.SAVE_FAILED ? null : current
        })
      } else {
        setStorageProblem(function (current) {
          return current === STORAGE_ERRORS.UNAVAILABLE ? current : STORAGE_ERRORS.SAVE_FAILED
        })
      }
    },
    [tasks, initialLoad],
  )

  // useCallback keeps these functions identical between renders. 

  const addTask = useCallback(function (fields) {
    dispatch({ type: ACTION_TYPES.ADD, task: createTask(fields) })
  }, [])

  const updateTask = useCallback(function (id, fields) {
    dispatch({
      type: ACTION_TYPES.UPDATE,
      id,
      changes: cleanTaskFields(fields),
      updatedAt: new Date().toISOString(),
    })
  }, [])

  const moveTask = useCallback(function (id, newStatus) {
    dispatch({
      type: ACTION_TYPES.MOVE,
      id,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    })
  }, [])

  const deleteTask = useCallback(function (id) {
    dispatch({ type: ACTION_TYPES.DELETE, id })
  }, [])

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