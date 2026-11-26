
// type defaults to "button" so a button inside a form never submits it by accident.

const baseClasses =
  'inline-flex cursor-pointer items-center justify-center rounded-md border font-medium ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const variantClasses = {
  primary: 'border-transparent bg-brand-600 text-white enabled:hover:bg-brand-700',
  secondary: 'border-slate-300 bg-white text-slate-700 enabled:hover:bg-slate-50',
  destructive: 'border-transparent bg-red-600 text-white enabled:hover:bg-red-700',
}

const sizeClasses = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
}

function Button({ variant = 'primary', size = 'md', type = 'button', className = '', children, ...otherProps }) {
  const allClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <button type={type} className={allClasses} {...otherProps}>
      {children}
    </button>
  )
}

export default Button