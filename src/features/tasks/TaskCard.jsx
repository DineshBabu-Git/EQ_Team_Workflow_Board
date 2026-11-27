// Props: task (one task object), onMove(taskId, newStatus), onEdit(task), onDelete(task).
// Purely presentational: it shows the task and reports clicks to its parent,
// and it never touches storage or context itself.
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, Select } from '../../components/ui'
import { PRIORITY_COLORS, STATUSES } from '../../utils/constants'
import { getRelativeTime } from '../../utils/relativeTime'
import { getStatusSelectId } from './taskDomIds'
import { memo } from 'react'

function TaskCard({ task, onMove, onEdit, onDelete }) {
  function handleStatusChange(event) {
    onMove(task.id, event.target.value)
  }

  function handleEditClick() {
    onEdit(task)
  }

  function handleDeleteClick() {
    onDelete(task)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold break-words text-slate-900">{task.title}</h3>
          <Badge color={PRIORITY_COLORS[task.priority]}>{task.priority} priority</Badge>
        </div>
      </CardHeader>

      <CardBody className="space-y-2 text-sm text-slate-600">
        <p>Assignee: {task.assignee}</p>

        {task.tags.length > 0 && (
          <ul aria-label="Tags" className="flex flex-wrap gap-1">
            {task.tags.map(function (tag) {
              return (
                <li key={tag}>
                  <Badge>{tag}</Badge>
                </li>
              )
            })}
          </ul>
        )}

        <p className="text-xs text-slate-500">
          updated{' '}
          <time dateTime={task.updatedAt} title={new Date(task.updatedAt).toLocaleString()}>
            {getRelativeTime(task.updatedAt)}
          </time>
        </p>
      </CardBody>

      <CardFooter className="flex flex-wrap items-end justify-between gap-2">
        {/* The label is only for screen readers; sighted users see the selected status. */}
        <div className="min-w-32 flex-1">
          <Select
            id={getStatusSelectId(task.id)}
            label={`Status of ${task.title}`}
            hideLabel
            options={STATUSES}
            value={task.status}
            onChange={handleStatusChange}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleEditClick} aria-label={`Edit ${task.title}`}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteClick} aria-label={`Delete ${task.title}`}>
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// memo makes React skip this card when its props are the same as last time. That only works
// because the parent passes stable props: the task object keeps its identity until it
// actually changes, and the three callbacks come from useCallback.
export default memo(TaskCard)