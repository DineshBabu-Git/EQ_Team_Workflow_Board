// Props: status (column name), tasks (already filtered for this column), onMove, onEdit, onDelete.
// A <section> labelled by its heading, so screen readers can jump between the columns.
import { useId } from 'react'
import TaskCard from './TaskCard'

function TaskColumn({ status, tasks, onMove, onEdit, onDelete }) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className="rounded-lg bg-slate-100 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 id={headingId} className="font-semibold text-slate-800">
          {status}
        </h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <p className="rounded border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
          No tasks here
        </p>
      ) : (
        <ul className="space-y-3">
          {tasks.map(function (task) {
            return (
              <li key={task.id}>
                <TaskCard task={task} onMove={onMove} onEdit={onEdit} onDelete={onDelete} />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default TaskColumn