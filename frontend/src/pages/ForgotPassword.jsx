import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { ROUTES } from '@/lib/constants'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) return toast.error(error.message)
    setSent(true)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(160deg, #0f0f0f 0%, #1a0a0f 50%, #0f0f0f 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <Link to={ROUTES.LOGIN} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none',
          marginBottom: 32,
        }}>
          <ArrowLeft size={14} /> Back to login
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: 'rgba(244,63,94,0.15)',
            border: '1px solid rgba(244,63,94,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Heart size={20} color="#f43f5e" fill="#f43f5e" />
          </div>
          <span style={{ color: 'white', fontWeight: 900, fontSize: 20 }}>MMUST Dating</span>
        </div>

        <h2 style={{ color: 'white', fontWeight: 900, fontSize: 24, marginBottom: 6 }}>
          {sent ? 'Check your email 📬' : 'Forgot password?'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>
          {sent
            ? `We sent a reset link to ${email}. Check your inbox and follow the link.`
            : "No worries — enter your email and we'll send you a reset link."}
        </p>

        {!sent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, padding: '13px 16px',
                color: 'white', fontSize: 14, outline: 'none',
                width: '100%', boxSizing: 'border-box',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                border: 'none', borderRadius: 14, padding: '15px',
                color: 'white', fontWeight: 800, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 8px 28px rgba(244,63,94,0.35)',
              }}
            >
              {loading
                ? <svg style={{ animation: 'spin 1s linear infinite', width: 20, height: 20 }} fill="none" viewBox="0 0 24 24">
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" strokeOpacity="0.25"/>
                    <path fill="white" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                : 'Send Reset Link'
              }
            </button>
          </div>
        )}

        {sent && (
          <Link to={ROUTES.LOGIN} style={{
            display: 'block', textAlign: 'center',
            color: '#fb7185', fontWeight: 700, fontSize: 14,
            textDecoration: 'none', marginTop: 8,
          }}>
            ← Back to login
          </Link>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
