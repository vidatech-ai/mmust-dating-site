import { useState, useEffect } from 'react'
import { Download, X, Share } from 'lucide-react'

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isInStandaloneMode()) return // already installed, hide

    if (isIOS()) {
      setVisible(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible) return null

  const handleClick = async () => {
    if (isIOS()) {
      setShowIOSModal(true)
      return
    }
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setDeferredPrompt(null)
  }

  return (
    <>
      {/* Install button — fixed bottom-right, above bottom nav */}
      <button
        onClick={handleClick}
        style={{
          position: 'fixed',
          bottom: 74,
          right: 16,
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '10px 16px',
          borderRadius: 999,
          background: '#f43f5e',
          border: 'none',
          color: 'white',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(244,63,94,0.45)',
        }}
      >
        <Download size={15} />
        Install App
      </button>

      {/* iOS instructions modal */}
      {showIOSModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}
          onClick={() => setShowIOSModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 480,
              background: '#1a1a1a',
              borderRadius: '24px 24px 0 0',
              padding: '28px 24px 48px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ color: 'white', fontWeight: 800, fontSize: 17, margin: 0 }}>Install MMUST Dating</p>
              <button onClick={() => setShowIOSModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                <X size={20} />
              </button>
            </div>

            {[
              { icon: <Share size={20} color="#0a84ff" />, text: <>Tap the <strong style={{color:'white'}}>Share</strong> button at the bottom of your browser</> },
              { icon: <span style={{ fontSize: 20 }}>⬆️</span>, text: <>Scroll down and tap <strong style={{color:'white'}}>"Add to Home Screen"</strong></> },
              { icon: <span style={{ fontSize: 20 }}>✅</span>, text: <>Tap <strong style={{color:'white'}}>"Add"</strong> — the app will appear on your home screen</> },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {step.icon}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, margin: 0, paddingTop: 8 }}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default PWAInstallButton
