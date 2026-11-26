
// forwardRef lets a parent form call .focus() on this input, for example to jump
// to the first invalid field after a failed submit.

import { forwardRef } from 'react'
import FieldMessage from './FieldMessage'
import { buildDescribedBy, getFieldClasses, labelClasses } from './fieldHelpers'

const TextInput = forwardRef(function TextInput({ id, label, error, hint, type = 'text', ...inputProps }, ref) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={buildDescribedBy({ hintId, errorId, hasHint: Boolean(hint), hasError: Boolean(error) })}
        className={getFieldClasses(Boolean(error))}
        {...inputProps}
      />
      <FieldMessage id={hintId}>{hint}</FieldMessage>
      <FieldMessage id={errorId} variant="error">
        {error}
      </FieldMessage>
    </div>
  )
})

export default TextInput