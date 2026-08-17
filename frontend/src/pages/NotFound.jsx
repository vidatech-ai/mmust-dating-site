import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import Button from '@/components/ui/Button'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#111111]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <p className="text-8xl font-black text-white/10">404</p>
        <div>
          <h2 className="text-2xl font-black text-white">Lost?</h2>
          <p className="text-white/40 text-sm mt-2">
            This page doesn't exist.<br />Let's get you back.
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.DISCOVER)}>
          <Home size={16} /> Go Home
        </Button>
      </motion.div>
    </div>
  )
}

export default NotFound