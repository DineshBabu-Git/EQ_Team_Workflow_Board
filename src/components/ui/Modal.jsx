
// children (dialog content, including its own buttons).
// Rendered in a portal on document.body so parent overflow/z-index can never clip it.

import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// How many modals are open right now. Two can be open at once (the discard confirm sits on
// top of the form), and the page may only scroll again when the LAST one closes. Counting
// works whatever order they close in, which saving and restoring a value does not.
let openModalCount = 0;

function Modal({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  // This effect depends ONLY on isOpen on purpose. If it depended on onClose, it would
  // re-run every time the parent re-renders and steal focus back to the first field.

  useEffect(
    function handleOpenAndClose() {
      if (!isOpen) {
        return
      }

      // Remember who opened the modal so focus can go back there when it closes.
      const openerElement = document.activeElement

      // Stop the page behind the modal from scrolling.
      openModalCount += 1
      document.body.style.overflow = 'hidden'

      // Focus the first form field if there is one, otherwise the first focusable thing

      const dialog = dialogRef.current
      const firstField = dialog.querySelector('input, textarea, select')
      const firstFocusable = firstField || dialog.querySelector(FOCUSABLE_SELECTOR)
      if (firstFocusable) {
        firstFocusable.focus()
      } else {
        dialog.focus()
      }

      return function cleanup() {
        openModalCount -= 1;
        if (openModalCount === 0) {
          document.body.style.overflow = ''
        }
        if (openerElement && openerElement.focus) {
          openerElement.focus()
        }
      }
    },
    [isOpen],
  )

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      // stopPropagation so a modal opened on top of another one only closes itself.
      event.stopPropagation()
      onClose()
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    // Focus trap: wrap Tab / Shift+Tab around the first and last focusable element.
    const focusableElements = dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
    if (focusableElements.length === 0) {
      event.preventDefault()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    const activeElement = document.activeElement

    if (event.shiftKey && (activeElement === firstElement || activeElement === dialogRef.current)) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  // mousedown and mouse over events

  function handleBackdropMouseDown(event) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl focus:outline-none"
      >
        <h2 id={titleId} className="mb-4 text-lg font-semibold text-slate-900">
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export default Modal