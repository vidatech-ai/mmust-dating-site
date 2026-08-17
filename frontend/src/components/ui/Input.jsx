const Input = ({
  label,
  error,
  icon: Icon,
  type = 'text',
  placeholder,
  className = '',
  ...rest
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-white/70 flex items-center gap-2">
          {Icon && <Icon size={15} className="text-white/40" />}
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`
          w-full bg-white/5 border border-white/10
          rounded-xl px-4 py-3 text-white text-sm
          placeholder:text-white/30
          focus:outline-none focus:border-brand-500
          transition-colors duration-200
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...rest}
      />
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  )
}

export default Input
