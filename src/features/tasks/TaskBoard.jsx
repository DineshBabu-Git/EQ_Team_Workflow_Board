// The container for the board. It reads tasks from context, groups them into columns,
// and owns the create/edit dialog and the "delete this task?" confirmation.
// TaskColumn and TaskCard only display things.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, ConfirmModal, useToast } from '../../components/ui'
import useTasks from '../../hooks/useTasks'
import { STATUSES } from '../../utils/constants'
import { groupTasksByStatus } from '../../utils/groupTasks'
import StorageAlert from './StorageAlert'
import TaskColumn from './TaskColumn'
import TaskModal from './TaskModal'
import { getStatusSelectId } from './taskDomIds'
import useTaskFilters from '../../hooks/useTaskFilters'
import { filterAndSortTasks } from '../../utils/filterAndSort'
import TaskFilters from './TaskFilters'

function TaskBoard() {
  const { tasks, storageProblem, addTask, updateTask, moveTask, deleteTask, dismissStorageProblem } = useTasks()
  const { showToast } = useToast()
  const {
    filters,
    hasActiveFilters,
    toggleStatus,
    setPriority,
    setSearchText,
    setSortField,
    setSortDirection,
    clearFilters,
  } = useTaskFilters()

  // The form dialog: closed, open to create (task is null), or open to edit (task is set).
  const [formDialog, setFormDialog] = useState({ isOpen: false, task: null })

  // The task waiting for delete confirmation, or null when no confirm is open.
  const [taskToDelete, setTaskToDelete] = useState(null)

  // Remembers which task's select should get focus after the next render.
  const taskIdToFocusRef = useRef(null)

  // Filter and sort first, then split into columns. Both steps only rerun when their input changes.
  const visibleTasks = useMemo(
    function () {
      return filterAndSortTasks(tasks, filters)
    },
    [tasks, filters],
  )

  const tasksByStatus = useMemo(
    function () {
      return groupTasksByStatus(visibleTasks)
    },
    [visibleTasks],
  )

  // A task that changes column makes its card unmount in one column and mount in another,
  // which drops keyboard focus. After the new render, put focus back on that task's select.
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

  const handleEditRequest = useCallback(function (task) {
    setFormDialog({ isOpen: true, task })
  }, [])

  const handleDeleteRequest = useCallback(function (task) {
    setTaskToDelete(task)
  }, [])

  function handleNewTaskClick() {
    setFormDialog({ isOpen: true, task: null })
  }

  function handleFormClose() {
    setFormDialog({ isOpen: false, task: null })
  }

  function handleFormSave(fields) {
    const editedTask = formDialog.task

    if (editedTask) {
      updateTask(editedTask.id, fields)
      // If the edit moved the task to another column, its Edit button is gone, so the
      // dialog cannot give focus back to it. Focus the task's select instead.
      if (fields.status !== editedTask.status) {
        taskIdToFocusRef.current = editedTask.id
      }
      showToast('Task updated')
    } else {
      addTask(fields)
      showToast('Task created')
    }

    handleFormClose()
  }

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

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
        <Button onClick={handleNewTaskClick}>New task</Button>
      </div>

      <div className="mb-3">
        <TaskFilters
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onToggleStatus={toggleStatus}
          onPriorityChange={setPriority}
          onSearchChange={setSearchText}
          onSortFieldChange={setSortField}
          onSortDirectionChange={setSortDirection}
          onClear={clearFilters}
        />
      </div>

      {/* Polite live region: screen reader users hear how many tasks match after filtering. */}
      <p aria-live="polite" className="mb-3 text-sm text-slate-600">
        Showing {visibleTasks.length} of {tasks.length} tasks
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {STATUSES.map(function (status) {
          return (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onMove={handleMove}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
            />
          )
        })}
      </div>

      {formDialog.isOpen && <TaskModal task={formDialog.task} onSave={handleFormSave} onClose={handleFormClose} />}

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