import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { ROUTES } from '@/lib/constants'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
})

const SLIDES = [
  { img: '/slide1.jpg', caption: 'Empowering Dreams at MMUST' },
  { img: '/slide2.jpg', caption: 'Shaping Minds, Inspiring Futures' },
  { img: '/slide3.jpg', caption: 'The University of Choice' },
  { img: '/slide4.jpg', caption: 'Advancing Excellence in Innovation' },
  { img: '/couple1.jpg', caption: 'Find your forever person' },
  { img: '/couple2.jpg', caption: 'Love is just a match away' },
  { img: '/couple3.jpg', caption: 'Real love. Real campus. Real you.' },
]

const QUOTES = [
  { text: '"The best thing to hold onto in life is each other."', author: '— Audrey Hepburn' },
  { text: '"You are my today and all of my tomorrows."', author: '— Leo Christopher' },
  { text: '"In all the world, there is no heart for me like yours."', author: '— Maya Angelou' },
  { text: '"I love you not only for what you are, but for what I am when I am with you."', author: '— Roy Croft' },
  { text: '"Where there is love there is life."', author: '— Mahatma Gandhi' },
  { text: '"Love is composed of a single soul inhabiting two bodies."', author: '— Aristotle' },
]

let deferredPrompt = null
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
})

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [slide, setSlide] = useState(0)
  const [quote, setQuote] = useState(0)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setQuote(q => (q + 1) % QUOTES.length), 3500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    // Check immediately and also listen for the event firing after mount
    if (deferredPrompt) setShowInstall(true)
    const handler = () => setShowInstall(true)
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      deferredPrompt = null
      setShowInstall(false)
    }
  }

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
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* FULL SCREEN BACKGROUND SLIDESHOW */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${SLIDES[slide].img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </AnimatePresence>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.88) 100%)'
        }} />
      </div>

      {/* CONTENT */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        width: '100%', height: '100%',
        overflowY: 'auto',
      }}>

        {/* ── TOP — Brand + Rotating Love Quotes ── */}
        <div style={{ padding: '28px 24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img src="/icon-192.png" alt="MMUST Dating" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 8 }} />
            </div>
            <span style={{ color: 'white', fontWeight: 900, fontSize: 20, letterSpacing: '-0.5px', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              MMUST Dating
            </span>
          </div>

          {/* Rotating love quotes */}
          <div style={{
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '18px 20px',
            minHeight: 90,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={quote}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.6 }}
              >
                <p style={{
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: 14, fontStyle: 'italic',
                  lineHeight: 1.6, marginBottom: 6,
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}>
                  {QUOTES[quote].text}
                </p>
                <p style={{ color: 'rgba(255,182,193,0.85)', fontSize: 12, fontWeight: 600 }}>
                  {QUOTES[quote].author}
                </p>
              </motion.div>
            </AnimatePresence>
            <div style={{ display: 'flex', gap: 5, marginTop: 12 }}>
              {QUOTES.map((_, i) => (
                <div key={i} style={{
                  height: 3, borderRadius: 9999,
                  width: i === quote ? 20 : 5,
                  background: i === quote ? '#fb7185' : 'rgba(255,255,255,0.25)',
                  transition: 'all 0.3s',
                }} />
              ))}
            </div>
          </div>

          {/* ── PWA Install Card — centered, visible, non-blocking ── */}
          {showInstall && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'rgba(244,63,94,0.15)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(244,63,94,0.35)',
                borderRadius: 18,
                padding: '14px 18px',
              }}
            >
              <img src="/icon-192.png" alt="icon" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ color: 'white', fontWeight: 800, fontSize: 14, marginBottom: 2 }}>Install MMUST Dating</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Add to home screen for the best experience</p>
              </div>
              <button
                onClick={handleInstall}
                style={{
                  background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                  border: 'none', borderRadius: 12,
                  padding: '8px 14px',
                  color: 'white', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(244,63,94,0.4)',
                }}
              >
                <Download size={14} /> Install
              </button>
            </motion.div>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* ── BOTTOM — Slide caption + Form ── */}
        <div style={{ padding: '0 16px 40px' }}>

          {/* Slide caption + dots */}
          <div style={{ padding: '0 8px 20px' }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={slide}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  color: 'white', fontSize: 22, fontWeight: 900,
                  lineHeight: 1.25, marginBottom: 10,
                  textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                }}
              >
                {SLIDES[slide].caption}
              </motion.p>
            </AnimatePresence>
            <div style={{ display: 'flex', gap: 6 }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  style={{
                    height: 4, borderRadius: 9999, border: 'none', cursor: 'pointer', padding: 0,
                    width: i === slide ? 24 : 7,
                    background: i === slide ? 'white' : 'rgba(255,255,255,0.3)',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Form card */}
          <div style={{
            background: 'rgba(8,8,8,0.78)',
            backdropFilter: 'blur(24px)',
            borderRadius: 28,
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '28px 22px',
          }}>
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 900, marginBottom: 2 }}>Welcome back 👋</h2>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, marginBottom: 22 }}>Sign in to continue your journey</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Email</label>
                <input
                  type="email"
                  placeholder="you@gmail.com"
                  autoComplete="email"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: errors.email ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14, padding: '13px 16px',
                    color: 'white', fontSize: 14, outline: 'none',
                    width: '100%', boxSizing: 'border-box',
                  }}
                  {...register('email')}
                />
                {errors.email && <span style={{ color: '#f87171', fontSize: 12 }}>{errors.email.message}</span>}
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: errors.password ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14, padding: '13px 16px',
                    color: 'white', fontSize: 14, outline: 'none',
                    width: '100%', boxSizing: 'border-box',
                  }}
                  {...register('password')}
                />
                {errors.password && <span style={{ color: '#f87171', fontSize: 12 }}>{errors.password.message}</span>}
              </div>

              {/* Sign In button */}
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                style={{
                  width: '100%', background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                  border: 'none', borderRadius: 14, padding: '15px',
                  color: 'white', fontWeight: 800, fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 8px 28px rgba(244,63,94,0.4)',
                  transition: 'opacity 0.2s, transform 0.15s',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {loading
                  ? <svg style={{ animation: 'spin 1s linear infinite', width: 20, height: 20 }} fill="none" viewBox="0 0 24 24">
                      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" strokeOpacity="0.25"/>
                      <path fill="white" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  : <><Heart size={16} fill="white" color="white" /> Sign In</>
                }
              </button>

              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                <a href="/forgot-password" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, display: 'block', textAlign: 'center', textDecoration: 'none', marginBottom: 4 }}>Forgot password?</a>
                New here?{' '}
                <Link to={ROUTES.REGISTER} style={{ color: '#fb7185', fontWeight: 700, textDecoration: 'none' }}>
                  Create account →
                </Link>
              </p>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.12)', fontSize: 11, marginTop: 18 }}>
            MMUST students only · Be respectful · Have fun
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
