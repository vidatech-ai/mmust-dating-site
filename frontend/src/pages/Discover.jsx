import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, SlidersHorizontal, MessageCircle, MapPin, GraduationCap, User, HeadphonesIcon, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { useProfiles, useLikes } from '@/hooks/useProfiles'
import { useChatUnlock } from '@/hooks/useChat'
import { usePaystack } from '@/hooks/usePaystack'
import { COURSES, GENDERS, YEARS, ROUTES } from '@/lib/constants'
import TopBar from '@/components/layout/TopBar'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'

// PWA install prompt
let deferredPrompt = null
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
})

const BottomNav = ({ navigate }) => {
  const path = window.location.pathname
  const items = [
    { icon: Heart, label: 'Discover', route: ROUTES.DISCOVER },
    { icon: MessageCircle, label: 'Chats', route: ROUTES.CHAT },
    { icon: User, label: 'Profile', route: ROUTES.PROFILE },
    { icon: HeadphonesIcon, label: 'Support', route: ROUTES.SUPPORT },
  ]
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(10,10,10,0.96)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {items.map(({ icon: Icon, label, route }) => {
        const active = path === route
        return (
          <button
            key={route}
            onClick={() => navigate(route)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '10px 0', background: 'none', border: 'none',
              cursor: 'pointer', gap: 4,
            }}
          >
            <Icon size={20} color={active ? '#f43f5e' : 'rgba(255,255,255,0.35)'} fill={active && label === 'Discover' ? '#f43f5e' : 'none'} />
            <span style={{ color: active ? '#f43f5e' : 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

const PWAInstallButton = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const check = () => setVisible(!!deferredPrompt)
    check()
    window.addEventListener('beforeinstallprompt', check)
    return () => window.removeEventListener('beforeinstallprompt', check)
  }, [])

  if (!visible) return null

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      deferredPrompt = null
      setVisible(false)
    }
  }

  return (
    <button
      onClick={handleInstall}
      style={{
        position: 'fixed', bottom: 70, right: 16,
        background: 'rgba(244,63,94,0.15)',
        border: '1px solid rgba(244,63,94,0.3)',
        borderRadius: 20, padding: '8px 14px',
        display: 'flex', alignItems: 'center', gap: 6,
        color: '#fb7185', fontSize: 12, fontWeight: 700,
        cursor: 'pointer', zIndex: 49,
        backdropFilter: 'blur(12px)',
      }}
    >
      <Download size={13} /> Install App
    </button>
  )
}

const PreferencesDrawer = ({ isOpen, onClose, filters, setFilters, onApply }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Who are you looking for?">
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">Gender</label>
        <select
          value={filters.gender}
          onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
        >
          <option value="" className="bg-[#111]">Everyone</option>
          {GENDERS.map(g => <option key={g} value={g} className="bg-[#111]">{g}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">Age range</label>
        <div className="flex items-center gap-3">
          <input type="number" min={18} max={60} placeholder="Min"
            value={filters.minAge}
            onChange={e => setFilters(f => ({ ...f, minAge: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
          />
          <span className="text-white/30">–</span>
          <input type="number" min={18} max={60} placeholder="Max"
            value={filters.maxAge}
            onChange={e => setFilters(f => ({ ...f, maxAge: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">Location</label>
        <input type="text" placeholder="e.g. Kakamega, Hostel B..."
          value={filters.location}
          onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">Course</label>
        <select value={filters.course}
          onChange={e => setFilters(f => ({ ...f, course: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
        >
          <option value="" className="bg-[#111]">Any</option>
          {COURSES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">Year</label>
        <select value={filters.year}
          onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
        >
          <option value="" className="bg-[#111]">Any</option>
          {YEARS.map(y => <option key={y} value={y} className="bg-[#111]">{y}</option>)}
        </select>
      </div>
      <Button size="full" onClick={onApply}>Apply Filters</Button>
    </div>
  </Modal>
)

const ProfileSlide = ({ profile, onLike, onMessage }) => (
  <div className="snap-start relative flex-shrink-0" style={{ height: 'calc(100dvh - 56px - 58px)', overflow: 'hidden' }}>
    {profile.photos?.length > 0 ? (
      <img src={profile.photos[0]} alt={profile.name} className="absolute inset-0 w-full h-full object-cover" />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center bg-white/5">
        <Avatar name={profile.name} size="xl" />
      </div>
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30" />
    <div className="absolute bottom-24 left-0 right-0 px-5">
      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-bold text-white">{profile.name}</h2>
        {profile.age && <span className="text-xl text-white/70 font-medium">{profile.age}</span>}
      </div>
      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
        <span className="flex items-center gap-1 text-white/60 text-xs">
          <GraduationCap size={13} /> {profile.course} · {profile.year}
        </span>
        {profile.location && (
          <span className="flex items-center gap-1 text-white/60 text-xs">
            <MapPin size={13} /> {profile.location}
          </span>
        )}
      </div>
      {profile.bio && <p className="text-white/85 text-sm mt-3 leading-relaxed">{profile.bio}</p>}
      {profile.interests?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {profile.interests.slice(0, 5).map(i => <Badge key={i} variant="brand">{i}</Badge>)}
        </div>
      )}
    </div>
    <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-5">
      <motion.button whileTap={{ scale: 0.88 }} onClick={() => onLike(profile.id, false)}
        className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
        <X size={22} className="text-white/70" />
      </motion.button>
      <motion.button whileTap={{ scale: 0.88 }} onClick={() => onMessage(profile)}
        className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
        <MessageCircle size={21} className="text-blue-400" />
      </motion.button>
      <motion.button whileTap={{ scale: 0.88 }} onClick={() => onLike(profile.id, true)}
        className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/40">
        <Heart size={24} className="text-white" fill="white" />
      </motion.button>
    </div>
  </div>
)

const UnlockModal = ({ isOpen, onClose, profile, onPay }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Unlock Chat">
    <div className="flex flex-col items-center gap-4 pb-2">
      <Avatar src={profile?.photos?.[0]} name={profile?.name} size="lg" />
      <div className="text-center">
        <p className="text-white font-semibold">{profile?.name}</p>
        <p className="text-white/40 text-sm">{profile?.course}</p>
      </div>
      <div className="w-full bg-white/5 rounded-2xl p-4 text-center">
        <p className="text-white/60 text-sm">Pay a one-time fee to start chatting</p>
        <p className="text-3xl font-black text-brand-400 mt-1">KES 50</p>
      </div>
      <Button size="full" onClick={onPay}>Pay & Unlock Chat</Button>
      <button onClick={onClose} className="text-white/30 text-sm">Cancel</button>
    </div>
  </Modal>
)

const Discover = () => {
  const [filters, setFilters] = useState({ gender: '', course: '', year: '', location: '', minAge: '', maxAge: '' })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [unlockTarget, setUnlockTarget] = useState(null)
  const navigate = useNavigate()

  const { profiles, loading, loadingMore, hasMore, fetchMore } = useProfiles(filters)
  const { likeProfile } = useLikes()
  const { checkUnlocked, unlockChat } = useChatUnlock()
  const { payChatUnlock } = usePaystack()

  const observerRef = useRef(null)
  const sentinelRef = useCallback(node => {
    if (loading) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) fetchMore()
    }, { rootMargin: '800px', threshold: 0 })
    if (node) observerRef.current.observe(node)
  }, [loading, hasMore, fetchMore])

  useEffect(() => () => observerRef.current?.disconnect(), [])

  const handleLike = async (profileId, liked) => {
    if (!liked) return
    try {
      await likeProfile(profileId)
      toast.success('Liked! 💕')
    } catch {
      toast.error('Something went wrong')
    }
  }

  const handleMessage = async (profile) => {
    const unlocked = await checkUnlocked(profile.id)
    if (unlocked) {
      navigate(`/chat/${profile.id}`)
    } else {
      setUnlockTarget(profile)
    }
  }

  const handlePay = () => {
    payChatUnlock({
      targetUserId: unlockTarget.id,
      onSuccess: async (reference) => {
        try {
          const convId = await unlockChat(unlockTarget.id, reference)
          toast.success('Chat unlocked! 🎉')
          setUnlockTarget(null)
          navigate(`/chat/${convId}`)
        } catch {
          toast.error('Payment verified but unlock failed. Contact support.')
        }
      },
      onClose: () => toast('Payment cancelled'),
    })
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', background: '#0a0a0a' }}>
      <TopBar
        title="Discover"
        right={
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10"
          >
            <SlidersHorizontal size={16} />
          </button>
        }
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><Spinner /></div>
      ) : profiles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
            <Heart size={36} className="text-white/20" />
          </div>
          <p className="text-white/40 text-center">
            No profiles match your preferences.<br />Try widening your filters.
          </p>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            Edit Preferences
          </Button>
        </div>
      ) : (
        <div
          className="flex-1 overflow-y-auto snap-y snap-mandatory"
          style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {profiles.map(profile => (
            <ProfileSlide
              key={profile.id}
              profile={profile}
              onLike={handleLike}
              onMessage={handleMessage}
            />
          ))}
          {hasMore && (
            <div ref={sentinelRef} className="flex items-center justify-center" style={{ height: 'calc(100dvh - 56px - 58px)' }}>
              {loadingMore ? <Spinner /> : <span className="text-white/20 text-xs">Loading more…</span>}
            </div>
          )}
          {!hasMore && (
            <div className="flex items-center justify-center" style={{ height: '30vh' }}>
              <p className="text-white/25 text-xs">You've reached the end ✨</p>
            </div>
          )}
        </div>
      )}

      <PWAInstallButton />
      <BottomNav navigate={navigate} />

      <PreferencesDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={() => setDrawerOpen(false)}
      />

      <UnlockModal
        isOpen={!!unlockTarget}
        onClose={() => setUnlockTarget(null)}
        profile={unlockTarget}
        onPay={handlePay}
      />
    </div>
  )
}

export default Discover
