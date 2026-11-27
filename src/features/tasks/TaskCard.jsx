// Props: task (one task object), onMove(taskId, newStatus), onDelete(task).
// Purely presentational: it shows the task and reports clicks to its parent,
// and it never touches storage or context itself.
import { Badge, Card, CardBody, CardFooter, CardHeader, Button, Select } from '../../components/ui'
import { PRIORITY_COLORS, STATUSES } from '../../utils/constants'
import { getRelativeTime } from '../../utils/relativeTime'
import { getStatusSelectId } from './taskDomIds'

function TaskCard({ task, onMove, onDelete }) {
  function handleStatusChange(event) {
    onMove(task.id, event.target.value)
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

      <CardFooter className="flex items-end justify-between gap-2">
        {/* The label is only for screen readers; sighted users see the selected status. */}
        <Select
          id={getStatusSelectId(task.id)}
          label={`Status of ${task.title}`}
          hideLabel
          options={STATUSES}
          value={task.status}
          onChange={handleStatusChange}
        />
        <Button variant="destructive" size="sm" onClick={handleDeleteClick} aria-label={`Delete ${task.title}`}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

export default TaskCard