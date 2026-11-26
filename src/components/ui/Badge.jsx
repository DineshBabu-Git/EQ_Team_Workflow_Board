
// The text always says what the badge means, so color is never the only signal.

const colorClasses = {
  gray: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
}

function Badge({ color = 'gray', children }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colorClasses[color]}`}>
      {children}
    </span>
  )
}

export default Badge