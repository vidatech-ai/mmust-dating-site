import { NavLink } from 'react-router-dom'
import { Compass, MessageCircle, User, Heart } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

const tabs = [
  { label: 'Discover', icon: Compass, route: ROUTES.DISCOVER },
  { label: 'Matches', icon: Heart, route: '/matches' },
  { label: 'Chat', icon: MessageCircle, route: ROUTES.CHAT },
  { label: 'Profile', icon: User, route: ROUTES.PROFILE },
]

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#111111]/95 backdrop-blur-sm border-t border-white/5 z-30 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ label, icon: Icon, route }) => (
          <NavLink
            key={route}
            to={route}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 px-4 py-2 rounded-xl
              transition-colors duration-200
              ${isActive ? 'text-brand-500' : 'text-white/40'}
            `}
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav