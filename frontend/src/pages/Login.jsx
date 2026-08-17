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
  { img: '/slide1.jpg', caption: 'Find your person at MMUST' },
  { img: '/slide2.jpg', caption: 'Real connections. Real campus life.' },
  { img: '/slide3.jpg', caption: 'Love starts here.' },
  { img: '/slide4.jpg', caption: 'University memories that last forever.' },
]

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4000)
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

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', overflow: 'hidden' }}>

      {/* FULL SCREEN SLIDESHOW BACKGROUND */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${SLIDES[slide].img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </AnimatePresence>

        {/* Dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.85) 100%)'
        }} />
      </div>

      {/* CONTENT — full screen, centered */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        width: '100%', height: '100%',
        overflowY: 'auto',
      }}>

        {/* Top bar */}
        <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 14,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Heart size={20} color="white" fill="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 900, fontSize: 20, letterSpacing: '-0.5px' }}>
            MMUST Dating
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom section — caption + form */}
        <div style={{ padding: '0 0 40px' }}>

          {/* Slide caption */}
          <div style={{ padding: '0 24px 24px' }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={slide}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ color: 'white', fontSize: 28, fontWeight: 900, lineHeight: 1.2, marginBottom: 12 }}
              >
                {SLIDES[slide].caption}
              </motion.p>
            </AnimatePresence>

            {/* Dots */}
            <div style={{ display: 'flex', gap: 6 }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  style={{
                    height: 4, borderRadius: 9999, border: 'none', cursor: 'pointer',
                    width: i === slide ? 28 : 8,
                    background: i === slide ? 'white' : 'rgba(255,255,255,0.35)',
                    transition: 'all 0.3s',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Form card */}
          <div style={{
            margin: '0 16px',
            background: 'rgba(10,10,10,0.75)',
            backdropFilter: 'blur(20px)',
            borderRadius: 28,
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '28px 24px',
          }}>
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Welcome back</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20 }}>Sign in to your account</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Email</label>
                <input
                  type="email"
                  placeholder="you@gmail.com"
                  autoComplete="email"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: errors.email ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16, padding: '14px 16px',
                    color: 'white', fontSize: 14, outline: 'none', width: '100%',
                    boxSizing: 'border-box',
                  }}
                  {...register('email')}
                />
                {errors.email && <span style={{ color: '#f87171', fontSize: 12 }}>{errors.email.message}</span>}
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: errors.password ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16, padding: '14px 16px',
                    color: 'white', fontSize: 14, outline: 'none', width: '100%',
                    boxSizing: 'border-box',
                  }}
                  {...register('password')}
                />
                {errors.password && <span style={{ color: '#f87171', fontSize: 12 }}>{errors.password.message}</span>}
              </div>

              {/* Button */}
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                style={{
                  width: '100%', background: '#f43f5e',
                  border: 'none', borderRadius: 16,
                  padding: '15px', color: 'white',
                  fontWeight: 800, fontSize: 15,
                  cursor: 'pointer', marginTop: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 8px 32px rgba(244,63,94,0.35)',
                  transition: 'transform 0.15s, background 0.15s',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {loading
                  ? <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  : <><Heart size={16} fill="white" color="white" /> Sign In</>
                }
              </button>

              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
                New here?{' '}
                <Link to={ROUTES.REGISTER} style={{ color: '#fb7185', fontWeight: 700, textDecoration: 'none' }}>
                  Create account →
                </Link>
              </p>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 11, marginTop: 20 }}>
            MMUST students only · Be respectful
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
