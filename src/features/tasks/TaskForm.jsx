// Props: values (strings, one per field), errors (object of messages, may be empty),
// onFieldChange(name, value), onSubmit(event), onCancel, submitLabel.
// Purely presentational: it shows the fields and reports changes. Validation, saving and
// the "unsaved changes" logic all live in TaskModal. Each input's `name` matches the
// key in `values`, so one change handler serves every field.
import { Button, Select, TextArea, TextInput } from '../../components/ui'
import { DESCRIPTION_MAX_LENGTH, PRIORITIES, STATUSES } from '../../utils/constants'
import { TASK_FORM_ID } from './taskDomIds'

function TaskForm({ values, errors, onFieldChange, onSubmit, onCancel, submitLabel }) {
  function handleChange(event) {
    onFieldChange(event.target.name, event.target.value)
  }

  // Counted after trimming so it matches what the validator checks.
  const descriptionLength = values.description.trim().length

  return (
    <form id={TASK_FORM_ID} noValidate onSubmit={onSubmit} className="space-y-4">
      <TextInput
        id="task-title"
        name="title"
        label="Title (required)"
        aria-required="true"
        value={values.title}
        onChange={handleChange}
        error={errors.title}
      />

      <TextArea
        id="task-description"
        name="description"
        label="Description"
        hint={`${descriptionLength} / ${DESCRIPTION_MAX_LENGTH} characters`}
        value={values.description}
        onChange={handleChange}
        error={errors.description}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="task-status"
          name="status"
          label="Status"
          options={STATUSES}
          value={values.status}
          onChange={handleChange}
          error={errors.status}
        />
        <Select
          id="task-priority"
          name="priority"
          label="Priority"
          options={PRIORITIES}
          value={values.priority}
          onChange={handleChange}
          error={errors.priority}
        />
      </div>

      <TextInput
        id="task-assignee"
        name="assignee"
        label="Assignee (required)"
        aria-required="true"
        value={values.assignee}
        onChange={handleChange}
        error={errors.assignee}
      />

      <TextInput
        id="task-tags"
        name="tags"
        label="Tags"
        hint="Separate tags with commas, for example: bug, urgent"
        value={values.tags}
        onChange={handleChange}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}

export default TaskForm