
// Wrap the app in <ToastProvider>. 

import { useCallback, useMemo, useRef, useState } from 'react'
import Toast from './Toast'
import { ToastContext } from './toastContext'

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextIdRef = useRef(1)

  // useCallback keeps these functions the same between renders, so Toast's timer
  // effect does not restart every time the toast list changes.

  const dismissToast = useCallback(function (id) {
    setToasts(function (currentToasts) {
      return currentToasts.filter(function (toast) {
        return toast.id !== id
      })
    })
  }, [])

  const showToast = useCallback(function (message, variant = 'success') {
    const id = nextIdRef.current
    nextIdRef.current += 1
    setToasts(function (currentToasts) {
      return [...currentToasts, { id, message, variant }]
    })
  }, [])

  // Without useMemo, a new object is created on every render and every component that
  // calls useToast would re-render each time a toast appears or disappears.

  const contextValue = useMemo(
    function () {
      return { showToast }
    },
    [showToast],
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* This container always exists. Live regions announce reliably when their
          contents change, but not always when the region itself is inserted. */}
      <div
        role="status"
        className="fixed right-4 top-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
      >
        {toasts.map(function (toast) {
          return (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              variant={toast.variant}
              onDismiss={dismissToast}
            />
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider