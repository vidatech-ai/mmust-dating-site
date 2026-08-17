import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, SlidersHorizontal, MessageCircle, MapPin, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useProfiles, useLikes } from '@/hooks/useProfiles'
import { useChatUnlock } from '@/hooks/useChat'
import { usePaystack } from '@/hooks/usePaystack'
import { COURSES, GENDERS, YEARS } from '@/lib/constants'
import PageWrapper from '@/components/layout/PageWrapper'
import TopBar from '@/components/layout/TopBar'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'

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
          <input
            type="number" min={18} max={60} placeholder="Min"
            value={filters.minAge}
            onChange={e => setFilters(f => ({ ...f, minAge: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
          />
          <span className="text-white/30">–</span>
          <input
            type="number" min={18} max={60} placeholder="Max"
            value={filters.maxAge}
            onChange={e => setFilters(f => ({ ...f, maxAge: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">Location</label>
        <input
          type="text" placeholder="e.g. Kakamega, Hostel B..."
          value={filters.location}
          onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">Course</label>
        <select
          value={filters.course}
          onChange={e => setFilters(f => ({ ...f, course: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
        >
          <option value="" className="bg-[#111]">Any</option>
          {COURSES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">Year</label>
        <select
          value={filters.year}
          onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
        >
          <option value="" className="bg-[#111]">Any</option>
          {YEARS.map(y => <option key={y} value={y} className="bg-[#111]">{y}</option>)}
        </select>
      </div>

      <Button size="full" onClick={onApply}>Apply Preferences</Button>
    </div>
  </Modal>
)

const ProfileCard = ({ profile, onLike, onMessage }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.4 }}
    className="bg-[#161616] rounded-3xl overflow-hidden border border-white/5 shadow-xl shadow-black/30"
  >
    <div className="relative w-full aspect-[3/4] bg-white/5">
      {profile.photos?.[0] ? (
        <img src={profile.photos[0]} alt={profile.name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Avatar name={profile.name} size="xl" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
          {profile.age && <span className="text-lg text-white/70 font-medium">{profile.age}</span>}
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-white/60 text-xs">
            <GraduationCap size={13} /> {profile.course} · {profile.year}
          </span>
          {profile.location && (
            <span className="flex items-center gap-1 text-white/60 text-xs">
              <MapPin size={13} /> {profile.location}
            </span>
          )}
        </div>
        {profile.bio && <p className="text-white/80 text-sm mt-2 line-clamp-2">{profile.bio}</p>}
        {profile.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {profile.interests.slice(0, 4).map(i => <Badge key={i} variant="brand">{i}</Badge>)}
          </div>
        )}
      </div>
    </div>

    <div className="flex items-center justify-around p-4">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => onLike(profile.id, false)}
        className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
        <X size={20} className="text-white/60" />
      </motion.button>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => onMessage(profile)}
        className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
        <MessageCircle size={19} className="text-blue-400" />
      </motion.button>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => onLike(profile.id, true)}
        className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
        <Heart size={20} className="text-white" fill="white" />
      </motion.button>
    </div>
  </motion.div>
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
    }, { rootMargin: '400px' })
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
    <PageWrapper>
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

      <div className="px-4 py-4">
        {loading ? (
          <Spinner />
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {profiles.map(profile => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onLike={handleLike}
                  onMessage={handleMessage}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {!loading && hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            {loadingMore && <Spinner />}
          </div>
        )}

        {!loading && !hasMore && profiles.length > 0 && (
          <p className="text-center text-white/25 text-xs py-8">You've reached the end ✨</p>
        )}
      </div>

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
    </PageWrapper>
  )
}

export default Discover
