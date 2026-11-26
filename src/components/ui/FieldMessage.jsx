
// Renders nothing when there is no text, so fields can always include it.

function FieldMessage({ id, variant = 'hint', children }) {
  if (!children) {
    return null
  }

  const colorClass = variant === 'error' ? 'text-red-600' : 'text-slate-500'

  return (
    <p id={id} className={`mt-1 text-xs ${colorClass}`}>
      {children}
    </p>
  )
}

export default FieldMessage