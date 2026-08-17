import { useState } from 'react'
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

// Real Unsplash photos — campus life + couples
const SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    caption: 'Find your person at MMUST',
  },
  {
    url: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200&q=80',
    caption: 'Real connections. Real campus life.',
  },
  {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80',
    caption: 'Love starts here.',
  },
  {
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
    caption: 'University memories that last forever.',
  },
]

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [slide, setSlide] = useState(0)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  // Auto-advance slides
  useState(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4000)
    return () => clearInterval(t)
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

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0a0a0a]">

      {/* ── LEFT / TOP — Hero image slideshow ── */}
      <div className="relative lg:flex-1 h-64 sm:h-80 lg:h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={slide}
            src={SLIDES[slide].url}
            alt=""
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-transparent via-black/30 to-black/80" />

        {/* Caption */}
        <div className="absolute bottom-6 left-6 right-6 lg:bottom-12 lg:left-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={slide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-white font-semibold text-lg lg:text-2xl drop-shadow-lg"
            >
              {SLIDES[slide].caption}
            </motion.p>
          </AnimatePresence>

          {/* Slide dots */}
          <div className="flex gap-2 mt-3">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        </div>

        {/* Brand badge top-left */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg">
            <Heart size={16} className="text-white" fill="white" />
          </div>
          <span className="text-white font-black text-lg tracking-tight">MMUST Dating</span>
        </div>
      </div>

      {/* ── RIGHT / BOTTOM — Auth form ── */}
      <div className="flex flex-col justify-center items-center px-6 py-10 lg:w-[420px] lg:px-12 lg:py-0 bg-[#0a0a0a]">
        <div className="w-full max-w-sm">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-white text-3xl font-black mb-1">Welcome back</h2>
            <p className="text-white/40 text-sm mb-8">Sign in to your MMUST Dating account</p>

            <div className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-semibold uppercase tracking-widest">Email</label>
                <input
                  type="email"
                  placeholder="you@gmail.com"
                  autoComplete="email"
                  className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-2xl px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-rose-500 transition-colors`}
                  {...register('email')}
                />
                {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-semibold uppercase tracking-widest">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-2xl px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-rose-500 transition-colors`}
                  {...register('password')}
                />
                {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
              </div>

              {/* Sign In button */}
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="w-full bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all duration-200 text-white font-bold py-3.5 rounded-2xl mt-2 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : (
                  <>
                    <Heart size={16} fill="white" />
                    Sign In
                  </>
                )}
              </button>

              <p className="text-center text-white/30 text-sm pt-2">
                New here?{' '}
                <Link to={ROUTES.REGISTER} className="text-rose-400 font-bold hover:text-rose-300">
                  Create account →
                </Link>
              </p>
            </div>
          </motion.div>
        </div>

        <p className="text-white/15 text-xs mt-12 text-center">
          MMUST students only · Be respectful · Have fun
        </p>
      </div>
    </div>
  )
}

export default Login
