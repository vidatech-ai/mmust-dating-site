import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

const PWAInstallBanner = () => {
  const [prompt, setPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setVisible(false)
    })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
      setPrompt(null)
    }
  }

  if (!visible || installed) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: 16,
      right: 16,
      zIndex: 9999,
      background: 'linear-gradient(135deg, #1a6b3a, #155c30)',
      borderRadius: 20,
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <img src="/icon-192.png" alt="MMUST Dating" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ color: 'white', fontWeight: 800, fontSize: 14, margin: 0 }}>Install MMUST Dating</p>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '2px 0 0' }}>Add to home screen — no browser needed</p>
      </div>

      <button
        onClick={handleInstall}
        style={{
          background: '#c9a84c',
          border: 'none',
          borderRadius: 12,
          padding: '9px 14px',
          color: 'white',
          fontWeight: 800,
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <Download size={14} /> Install
      </button>

      <button
        onClick={() => setVisible(false)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          flexShrink: 0,
        }}
      >
        <X size={16} color="rgba(255,255,255,0.5)" />
      </button>
    </div>
  )
}

export default PWAInstallBanner
