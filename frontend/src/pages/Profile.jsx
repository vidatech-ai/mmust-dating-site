import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Edit2, LogOut, Heart, MessageCircle, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/lib/constants'
import PageWrapper from '@/components/layout/PageWrapper'
import TopBar from '@/components/layout/TopBar'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

const StatCard = ({ label, value }) => (
  <div className="flex-1 bg-white/5 rounded-2xl p-4 text-center">
    <p className="text-2xl font-black text-white">{value}</p>
    <p className="text-white/40 text-xs mt-1">{label}</p>
  </div>
)

const Profile = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  if (!profile) return null

  return (
    <PageWrapper>
      <TopBar
        title="My Profile"
        right={
          <button
            onClick={() => navigate(ROUTES.EDIT_PROFILE)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10"
          >
            <Edit2 size={16} />
          </button>
        }
      />

      <div className="px-4 py-6 flex flex-col gap-6">
        {/* Avatar & Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="relative">
            <Avatar
              src={profile.photos?.[0]}
              name={profile.name}
              size="xl"
              className="border-4 border-brand-500"
            />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-white">{profile.name}</h2>
            <p className="text-white/40 text-sm">{profile.course} · {profile.year}</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="flex gap-3">
          <StatCard label="Likes" value="—" />
          <StatCard label="Matches" value="—" />
          <StatCard label="Chats" value="—" />
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-white/60 text-xs uppercase tracking-wider mb-2">About</p>
            <p className="text-white text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-white/60 text-xs uppercase tracking-wider mb-3">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map(i => (
                <Badge key={i} variant="brand">{i}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            size="full"
            variant="secondary"
            onClick={() => navigate(ROUTES.SUPPORT)}
          >
            <Heart size={16} /> Support the Creator
          </Button>
          <Button
            size="full"
            variant="ghost"
            onClick={signOut}
          >
            <LogOut size={16} /> Sign Out
          </Button>
        </div>
      </div>
    </PageWrapper>
  )
}

export default Profile