import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const TopBar = ({ title, showBack = false, right }) => {
  const navigate = useNavigate()

  return (
    <div className="sticky top-0 z-30 bg-[#111111]/95 backdrop-blur-sm border-b border-white/5">
      <div className="flex items-center justify-between px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className="text-lg font-bold text-white">{title}</h1>
        </div>
        {right && <div>{right}</div>}
      </div>
    </div>
  )
}

export default TopBar