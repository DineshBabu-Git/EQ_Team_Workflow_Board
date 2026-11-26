
// One toast removes itself after a few seconds. ToastProvider renders the list of these.

import { useEffect } from 'react'
import { statusClasses } from './statusStyles'

const AUTO_DISMISS_MS = 4000

function Toast({ id, message, variant, onDismiss }) {
  useEffect(
    function startDismissTimer() {
      const timerId = setTimeout(function () {
        onDismiss(id)
      }, AUTO_DISMISS_MS)

      // Clear the timer if the toast is closed early, so it never fires for a removed toast.
      return function clearTimer() {
        clearTimeout(timerId)
      }
    },
    [id, onDismiss],
  )

  return (
    <div className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-lg ${statusClasses[variant]}`}>
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={function () {
          onDismiss(id)
        }}
        aria-label="Dismiss notification"
        className="cursor-pointer rounded px-1 font-bold focus-visible:outline-2 focus-visible:outline-brand-600"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  )
}

export default Toast