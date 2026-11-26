
// emptyOptionLabel, hideLabel, error, hint, plus normal <select> props.

import { forwardRef } from 'react'
import FieldMessage from './FieldMessage'
import { buildDescribedBy, getFieldClasses, labelClasses } from './fieldHelpers'

const Select = forwardRef(function Select(
  { id, label, options, emptyOptionLabel, hideLabel = false, error, hint, ...selectProps },
  ref,
) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : labelClasses}>
        {label}
      </label>
      <select
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={buildDescribedBy({ hintId, errorId, hasHint: Boolean(hint), hasError: Boolean(error) })}
        className={getFieldClasses(Boolean(error))}
        {...selectProps}
      >
        {emptyOptionLabel && <option value="">{emptyOptionLabel}</option>}
        {options.map(function (option) {
          return (
            <option key={option} value={option}>
              {option}
            </option>
          )
        })}
      </select>
      <FieldMessage id={hintId}>{hint}</FieldMessage>
      <FieldMessage id={errorId} variant="error">
        {error}
      </FieldMessage>
    </div>
  )
})

export default Select