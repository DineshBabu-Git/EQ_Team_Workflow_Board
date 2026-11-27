// The container for the board. It reads tasks from context, groups them into columns,
// and owns the "delete this task?" confirmation. TaskColumn and TaskCard only display things.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ConfirmModal, useToast } from '../../components/ui'
import useTasks from '../../hooks/useTasks'
import { STATUSES } from '../../utils/constants'
import { groupTasksByStatus } from '../../utils/groupTasks'
import StorageAlert from './StorageAlert'
import TaskColumn from './TaskColumn'
import { getStatusSelectId } from './taskDomIds'

function TaskBoard() {
  const { tasks, storageProblem, moveTask, deleteTask, dismissStorageProblem } = useTasks()
  const { showToast } = useToast()

  // The task waiting for delete confirmation, or null when no confirm is open.
  const [taskToDelete, setTaskToDelete] = useState(null)

  // Remembers which task was just moved, so focus can go back to its select afterwards.
  const taskIdToFocusRef = useRef(null)

  const tasksByStatus = useMemo(
    function () {
      return groupTasksByStatus(tasks)
    },
    [tasks],
  )

  // Moving a task makes its card unmount in one column and mount in another, which
  // drops keyboard focus. After the new render, put focus back on that task's select.
  useEffect(
    function restoreFocusAfterMove() {
      const taskId = taskIdToFocusRef.current
      if (taskId === null) {
        return
      }
      taskIdToFocusRef.current = null

      const select = document.getElementById(getStatusSelectId(taskId))
      if (select) {
        select.focus()
      }
    },
    [tasks],
  )

  const handleMove = useCallback(
    function (taskId, newStatus) {
      taskIdToFocusRef.current = taskId
      moveTask(taskId, newStatus)
    },
    [moveTask],
  )

  const handleDeleteRequest = useCallback(function (task) {
    setTaskToDelete(task)
  }, [])

  function handleDeleteConfirm() {
    deleteTask(taskToDelete.id)
    setTaskToDelete(null)
    showToast('Task deleted')
  }

  function handleDeleteCancel() {
    setTaskToDelete(null)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {storageProblem && (
        <div className="mb-4">
          <StorageAlert problem={storageProblem} onDismiss={dismissStorageProblem} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {STATUSES.map(function (status) {
          return (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onMove={handleMove}
              onDelete={handleDeleteRequest}
            />
          )
        })}
      </div>

      <ConfirmModal
        isOpen={taskToDelete !== null}
        title="Delete task?"
        message={taskToDelete ? `"${taskToDelete.title}" will be permanently deleted.` : ''}
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}

export default TaskBoard