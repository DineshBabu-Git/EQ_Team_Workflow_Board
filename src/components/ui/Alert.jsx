
import { statusClasses } from './statusStyles'

function Alert({ variant = 'info', title, children, onDismiss }) {
  return (
    <div role="alert" className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${statusClasses[variant]}`}>
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="cursor-pointer rounded px-1 font-bold focus-visible:outline-2 focus-visible:outline-brand-600"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  )
}

export default Alert