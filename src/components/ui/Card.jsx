
// All take children and an optional className with several components

export function Card({ className = '', children }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children }) {
  return <div className={`px-4 pt-4 ${className}`}>{children}</div>
}

export function CardBody({ className = '', children }) {
  return <div className={`px-4 py-3 ${className}`}>{children}</div>
}

export function CardFooter({ className = '', children }) {
  return <div className={`border-t border-slate-100 px-4 py-3 ${className}`}>{children}</div>
}