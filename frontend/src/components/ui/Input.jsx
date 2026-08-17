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
        <label className="text-sm font-medium text-white/70">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            <Icon size={18} />
          </div>
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
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...rest}
        />
      </div>
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  )
}

export default Input