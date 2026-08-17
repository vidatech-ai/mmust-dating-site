import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { ROUTES } from '@/lib/constants'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
})

const SLIDES = [
  { gradient: 'from-rose-900 via-pink-900 to-purple-900', emoji: '💑', caption: 'Find your person at MMUST' },
  { gradient: 'from-purple-900 via-indigo-900 to-blue-900', emoji: '🎓', caption: 'Real connections. Real campus life.' },
  { gradient: 'from-pink-900 via-rose-800 to-orange-900', emoji: '❤️', caption: 'Love starts here.' },
  { gradient: 'from-indigo-900 via-purple-900 to-pink-900', emoji: '🌟', caption: 'University memories that last forever.' },
]

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 3500)
    return () => clearInterval(t)
  }, [])

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    navigate(ROUTES.DISCOVER)
  }

  const current = SLIDES[slide]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#0a0a0a' }}>

      {/* LEFT — Hero panel (hidden on small screens) */}
      <div style={{ display: 'none' }} className="lg:flex lg:flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-0 bg-gradient-to-br ${current.gradient}`}
          />
        </AnimatePresence>

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Heart size={20} className="text-white" fill="white" />
            </div>
            <span className="text-white font-black text-xl">MMUST Dating</span>
          </div>

          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-8xl mb-6">{current.emoji}</div>
                <p className="text-white text-4xl font-black leading-tight mb-4">{current.caption}</p>
                <p className="text-white/50 text-lg">Join thousands of MMUST students already connecting.</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2 mt-8">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex flex-col w-full lg:w-[440px] min-h-screen">

        {/* Mobile hero (shown only on small screens) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`lg:hidden h-48 bg-gradient-to-br ${current.gradient} flex flex-col items-center justify-center gap-3 relative`}
          >
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}
            />
            <div className="relative z-10 flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <Heart size={20} className="text-white" fill="white" />
              </div>
              <span className="text-white font-black text-2xl">MMUST Dating</span>
            </div>
            <p className="relative z-10 text-white/70 text-sm px-8 text-center">{current.caption}</p>
            <div className="relative z-10 flex gap-1.5 mt-1">
              {SLIDES.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === slide ? 'w-5 bg-white' : 'w-1.5 bg-white/30'}`} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm mx-auto"
          >
            <h2 className="text-white text-3xl font-black mb-1">Welcome back</h2>
            <p className="text-white/40 text-sm mb-8">Sign in to continue</p>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-white/50 text-xs font-bold uppercase tracking-widest">Email</label>
                <input
                  type="email"
                  placeholder="you@gmail.com"
                  autoComplete="email"
                  className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-2xl px-4 py-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-rose-500 transition-colors`}
                  {...register('email')}
                />
                {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/50 text-xs font-bold uppercase tracking-widest">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-2xl px-4 py-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-rose-500 transition-colors`}
                  {...register('password')}
                />
                {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
              </div>

              <button
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="w-full bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 mt-1"
              >
                {loading
                  ? <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  : <><Heart size={16} fill="white" /> Sign In</>
                }
              </button>

              <p className="text-center text-white/30 text-sm">
                New here?{' '}
                <Link to={ROUTES.REGISTER} className="text-rose-400 font-bold">
                  Create account →
                </Link>
              </p>
            </div>
          </motion.div>
        </div>

        <p className="text-white/15 text-xs pb-8 text-center">MMUST students only · Be respectful</p>
      </div>
    </div>
  )
}

export default Login
