// Props: title, description (optional), children (optional, usually the action button).
// A friendly box for "there is nothing to show here". The caller decides which message
// and which action fit the situation.
function EmptyState({ title, description, children }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

export default EmptyState