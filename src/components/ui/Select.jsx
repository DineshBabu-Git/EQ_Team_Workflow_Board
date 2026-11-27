
// options may be strings, or { value, label } objects when the text shown differs from the value.

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
          // A plain string is both the value and the text. An object lets them differ.
          const value = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          return (
            <option key={value} value={value}>
              {optionLabel}
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