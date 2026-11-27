// Props: totalCount (all tasks), visibleCount (tasks after filtering), tasksByStatus,
// onMove, onEdit, onDelete, onCreate, onClearFilters.
// Decides what the main area shows: "no tasks yet", "filters hide everything",
// or the three columns. Purely presentational.
import { Button, EmptyState } from '../../components/ui'
import { STATUSES } from '../../utils/constants'
import TaskColumn from './TaskColumn'

function BoardBody({ totalCount, visibleCount, tasksByStatus, onMove, onEdit, onDelete, onCreate, onClearFilters }) {
  if (totalCount === 0) {
    return (
      <EmptyState title="No tasks yet" description="Your board is empty. Create a task to get started.">
        <Button onClick={onCreate}>Create your first task</Button>
      </EmptyState>
    )
  }

  // Tasks exist but none match. Some filter must be active, otherwise everything would show.
  if (visibleCount === 0) {
    return (
      <EmptyState
        title="No tasks match your filters"
        description="Try a different search, or clear the filters to see all of your tasks."
      >
        <Button variant="secondary" onClick={onClearFilters}>
          Clear filters
        </Button>
      </EmptyState>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {STATUSES.map(function (status) {
        return (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onMove={onMove}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      })}
    </div>
  )
}

export default BoardBody