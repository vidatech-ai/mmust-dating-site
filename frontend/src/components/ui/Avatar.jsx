const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-20 h-20 text-xl',
  xl: 'w-28 h-28 text-2xl',
}

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    )
  }

  return (
    <div
      className={`
        ${sizes[size]}
        rounded-full bg-brand-500
        flex items-center justify-center
        font-bold text-white flex-shrink-0
        ${className}
      `}
    >
      {initials}
    </div>
  )
}

export default Avatar