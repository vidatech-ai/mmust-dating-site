import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, Filter, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useProfiles, useLikes } from '@/hooks/useProfiles'
import { useChatUnlock } from '@/hooks/useChat'
import { usePaystack } from '@/hooks/usePaystack'
import { COURSES, GENDERS, YEARS, ROUTES } from '@/lib/constants'
import PageWrapper from '@/components/layout/PageWrapper'
import TopBar from '@/components/layout/TopBar'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'

const FilterModal = ({ isOpen, onClose, filters, setFilters }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Filter Profiles">
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">Gender</label>
        <select
          value={filters.gender}
          onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
        >
          <option value="" className="bg-[#111]">All</option>
          {GENDERS.map(g => <option key={g} value={g} className="bg-[#111]">{g}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">Course</label>
        <select
          value={filters.course}
          onChange={e => setFilters(f => ({ ...f, course: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
        >
          <option value="" className="bg-[#111]">All</option>
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
          <option value="" className="bg-[#111]">All</option>
          {YEARS.map(y => <option key={y} value={y} className="bg-[#111]">{y}</option>)}
        </select>
      </div>

      <Button size="full" onClick={onClose}>Apply Filters</Button>
    </div>
  </Modal>
)

const ProfileCard = ({ profile, onLike, onMessage }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/5"
  >
    {/* Photo */}
    <div className="relative w-full aspect-[3/4] bg-white/5">
      {profile.photos?.[0] ? (
        <img
          src={profile.photos[0]}
          alt={profile.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Avatar name={profile.name} size="xl" />
        </div>
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
        <p className="text-white/60 text-sm">{profile.course} · {profile.year}</p>
        {profile.bio && (
          <p className="text-white/80 text-sm mt-2 line-clamp-2">{profile.bio}</p>
        )}
        {profile.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {profile.interests.slice(0, 4).map(i => (
              <Badge key={i} variant="brand">{i}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center justify-around p-4">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onLike(profile.id, false)}
        className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center"
      >
        <X size={24} className="text-white/60" />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onMessage(profile)}
        className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center"
      >
        <MessageCircle size={22} className="text-blue-400" />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onLike(profile.id, true)}
        className="w-14 h-14 rounded-full bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30"
      >
        <Heart size={24} className="text-white" fill="white" />
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
  const [filters, setFilters] = useState({ gender: '', course: '', year: '' })
  const [filterOpen, setFilterOpen] = useState(false)
  const [unlockTarget, setUnlockTarget] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const { profiles, loading } = useProfiles(filters)
  const { likeProfile } = useLikes()
  const { checkUnlocked, unlockChat } = useChatUnlock()
  const { payChatUnlock } = usePaystack()
  const navigate = useNavigate()

  const handleLike = async (profileId, liked) => {
    if (liked) {
      try {
        await likeProfile(profileId)
        toast.success('Liked! 💕')
      } catch {
        toast.error('Something went wrong')
      }
    }
    setCurrentIndex(i => i + 1)
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

  const currentProfile = profiles[currentIndex]

  return (
    <PageWrapper>
      <TopBar
        title="Discover"
        right={
          <button
            onClick={() => setFilterOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10"
          >
            <Filter size={16} />
          </button>
        }
      />

      <div className="px-4 py-4">
        {loading ? (
          <Spinner />
        ) : !currentProfile ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <Heart size={36} className="text-white/20" />
            </div>
            <p className="text-white/40 text-center">
              No more profiles.<br />Check back later!
            </p>
            <Button variant="secondary" onClick={() => setCurrentIndex(0)}>
              Start Over
            </Button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <ProfileCard
              key={currentProfile.id}
              profile={currentProfile}
              onLike={handleLike}
              onMessage={handleMessage}
            />
          </AnimatePresence>
        )}
      </div>

      <FilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
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