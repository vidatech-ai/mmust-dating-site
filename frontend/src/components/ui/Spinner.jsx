const Spinner = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#111111]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default Spinner