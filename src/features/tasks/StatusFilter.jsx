// Props: selectedStatuses (array), onToggle(status).
// A group of checkboxes inside a <fieldset>, so screen readers announce "Status" for the
// whole group. Each checkbox is wrapped by its label, which connects them without ids.
import { STATUSES } from '../../utils/constants'

function StatusFilter({ selectedStatuses, onToggle }) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-slate-700">Status (none selected shows all)</legend>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {STATUSES.map(function (status) {
          return (
            <label key={status} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={selectedStatuses.includes(status)}
                onChange={function () {
                  onToggle(status)
                }}
                className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              />
              {status}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export default StatusFilter