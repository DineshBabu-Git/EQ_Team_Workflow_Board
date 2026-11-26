
// forwardRef is used for the same reason as TextInput.

import { forwardRef } from 'react'
import FieldMessage from './FieldMessage'
import { buildDescribedBy, getFieldClasses, labelClasses } from './fieldHelpers'

const TextArea = forwardRef(function TextArea({ id, label, error, hint, rows = 4, ...textAreaProps }, ref) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={buildDescribedBy({ hintId, errorId, hasHint: Boolean(hint), hasError: Boolean(error) })}
        className={getFieldClasses(Boolean(error))}
        {...textAreaProps}
      />
      <FieldMessage id={hintId}>{hint}</FieldMessage>
      <FieldMessage id={errorId} variant="error">
        {error}
      </FieldMessage>
    </div>
  )
})

export default TextArea