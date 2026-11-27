// Props: task (the task to edit, or null to create a new one), onSave(fields), onClose().
// The container for the form dialog: it owns the form values, validation, the
// "discard unsaved changes?" confirm, and the focus jump to the first invalid field.
// It is rendered only while the dialog is open, so every open starts with fresh state.
import { useEffect, useState } from 'react'
import { ConfirmModal, Modal } from '../../components/ui'
import useDirtyForm from '../../hooks/useDirtyForm'
import { DEFAULT_PRIORITY, DEFAULT_STATUS } from '../../utils/constants'
import { hasErrors, parseTags, tagsToText, validateTaskForm } from '../../utils/validators'
import TaskForm from './TaskForm'
import { TASK_FORM_ID } from './taskDomIds'

// Every value is a string because that is what form fields hold. Tags become text here
// and are turned back into an array on save.
function getStartingValues(task) {
  if (task) {
    return {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      tags: tagsToText(task.tags),
    }
  }

  return {
    title: '',
    description: '',
    status: DEFAULT_STATUS,
    priority: DEFAULT_PRIORITY,
    assignee: '',
    tags: '',
  }
}

function TaskModal({ task, onSave, onClose }) {
  const { values, setFieldValue, isDirty } = useDirtyForm(getStartingValues(task))
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false)

  // How many times the user pressed Save and the form was invalid. Errors only appear
  // after the first failed attempt, so an empty new form is not covered in red errors.
  const [failedSubmitCount, setFailedSubmitCount] = useState(0)

  // Worked out on every render instead of stored, so errors disappear as soon as the
  // value is fixed and can never be out of date.
  const errors = failedSubmitCount > 0 ? validateTaskForm(values) : {}

  // Runs AFTER the re-render that shows the errors, so the field already has aria-invalid
  // and its error text when it receives focus. The first invalid field in the page is the
  // first one in the form, because the DOM order is the on-screen order.
  useEffect(
    function focusFirstInvalidField() {
      if (failedSubmitCount === 0) {
        return
      }
      const firstInvalidField = document.querySelector(`#${TASK_FORM_ID} [aria-invalid="true"]`)
      if (firstInvalidField) {
        firstInvalidField.focus()
      }
    },
    [failedSubmitCount],
  )

  // Cancel, Esc and a click on the backdrop all end up here.
  function requestClose() {
    if (isDirty) {
      setIsDiscardConfirmOpen(true)
    } else {
      onClose()
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const currentErrors = validateTaskForm(values)
    if (hasErrors(currentErrors)) {
      setFailedSubmitCount(failedSubmitCount + 1)
      return
    }

    // Editing without changing anything: just close, so "updated" is not bumped for nothing.
    if (task && !isDirty) {
      onClose()
      return
    }

    onSave({ ...values, tags: parseTags(values.tags) })
  }

  function handleKeepEditing() {
    setIsDiscardConfirmOpen(false)
  }

  function handleDiscard() {
    onClose()
  }

  return (
    <>
      {/* Always open while this component exists; the board decides when it exists. */}
      <Modal isOpen onClose={requestClose} title={task ? 'Edit task' : 'New task'}>
        <TaskForm
          values={values}
          errors={errors}
          onFieldChange={setFieldValue}
          onSubmit={handleSubmit}
          onCancel={requestClose}
          submitLabel={task ? 'Save changes' : 'Create task'}
        />
      </Modal>

      {/* A sibling of the form Modal, not a child, so Esc inside the confirm only closes the confirm. */}
      <ConfirmModal
        isOpen={isDiscardConfirmOpen}
        title="Discard changes?"
        message="You have unsaved changes. If you leave now, they will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        isDestructive
        onConfirm={handleDiscard}
        onCancel={handleKeepEditing}
      />
    </>
  )
}

export default TaskModal