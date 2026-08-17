import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, MessageCircle, DollarSign, Ban, CheckCircle, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAdmin } from '@/hooks/useAdmin'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import Input from '@/components/ui/Input'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-[#1a1a1a] rounded-2xl p-4 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-white">{value ?? '—'}</p>
      <p className="text-white/40 text-xs">{label}</p>
    </div>
  </div>
)

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      onLogin()
    } else {
      toast.error('Wrong password')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0f0f0f]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
            <Lock size={24} className="text-white/60" />
          </div>
          <h1 className="text-xl font-black text-white">Admin Access</h1>
          <p className="text-white/30 text-sm">Restricted area</p>
        </div>
        <Input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        <Button size="full" onClick={handleLogin}>
          Enter
        </Button>
      </motion.div>
    </div>
  )
}

const Dashboard = () => {
  const [authed, setAuthed] = useState(false)
  const { stats, users, loading, banUser, unbanUser } = useAdmin()

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />

  const handleBan = async (userId, isBanned) => {
    try {
      if (isBanned) {
        await unbanUser(userId)
        toast.success('User unbanned')
      } else {
        await banUser(userId)
        toast.success('User banned')
      }
    } catch {
      toast.error('Action failed')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-8">
      <div className="max-w-lg mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
          <p className="text-white/30 text-sm">MMUST Dating · Control Panel</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Users"
            value={stats?.totalUsers}
            icon={Users}
            color="bg-blue-500/20"
          />
          <StatCard
            label="Messages"
            value={stats?.totalMessages}
            icon={MessageCircle}
            color="bg-purple-500/20"
          />
          <StatCard
            label="Chat Unlocks"
            value={stats?.totalUnlocks}
            icon={CheckCircle}
            color="bg-green-500/20"
          />
          <StatCard
            label="Revenue (KES)"
            value={stats?.revenue}
            icon={DollarSign}
            color="bg-brand-500/20"
          />
        </div>

        {/* Users */}
        <div>
          <h2 className="text-white font-bold mb-3">All Users</h2>
          {loading ? (
            <Spinner />
          ) : (
            <div className="flex flex-col gap-3">
              {users.map(u => (
                <div
                  key={u.id}
                  className="bg-[#1a1a1a] rounded-2xl p-4 flex items-center gap-3"
                >
                  <Avatar name={u.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-semibold truncate">{u.name}</p>
                      {u.is_banned && <Badge variant="danger">Banned</Badge>}
                    </div>
                    <p className="text-white/30 text-xs truncate">{u.course} · {u.year}</p>
                  </div>
                  <button
                    onClick={() => handleBan(u.id, u.is_banned)}
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                      ${u.is_banned ? 'bg-green-500/20' : 'bg-red-500/20'}
                    `}
                  >
                    {u.is_banned
                      ? <CheckCircle size={16} className="text-green-400" />
                      : <Ban size={16} className="text-red-400" />
                    }
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard