import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Edit2, LogOut, Heart, Lock, MessageCircle, Send, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { usePaystack } from '@/hooks/usePaystack'
import { ROUTES, WHATSAPP_UNLOCK_AMOUNT, COMMENT_UNLOCK_AMOUNT } from '@/lib/constants'
import PageWrapper from '@/components/layout/PageWrapper'
import TopBar from '@/components/layout/TopBar'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

const StatCard = ({ label, value }) => (
  <div className="flex-1 bg-white/5 rounded-2xl p-4 text-center">
    <p className="text-2xl font-black text-white">{value}</p>
    <p className="text-white/40 text-xs mt-1">{label}</p>
  </div>
)

const Profile = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { payWhatsappUnlock, payCommentUnlock } = usePaystack()

  const [waUnlocked, setWaUnlocked] = useState(false)
  const [waUnlocking, setWaUnlocking] = useState(false)
  const [showWaModal, setShowWaModal] = useState(false)

  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentUnlocked, setCommentUnlocked] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!profile) return
    // Check if user already unlocked their own WhatsApp (always show own)
    setWaUnlocked(true)
    loadComments()
    checkCommentUnlock()
  }, [profile])

  const loadComments = async () => {
    if (!profile) return
    const { data } = await supabase
      .from('profile_comments')
      .select('id, text, created_at, commenter:profiles!profile_comments_commenter_id_fkey(name, photos)')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
    setComments(data || [])
  }

  const checkCommentUnlock = async () => {
    if (!profile) return
    const { data } = await supabase
      .from('comment_unlocks')
      .select('id')
      .eq('user_id', profile.id)
      .eq('profile_id', profile.id)
      .maybeSingle()
    // Own profile: always allow
    setCommentUnlocked(true)
  }

  const handlePostComment = async () => {
    if (!commentText.trim()) return
    setSubmitting(true)
    const { error } = await supabase.from('profile_comments').insert({
      profile_id: profile.id,
      commenter_id: profile.id,
      text: commentText.trim(),
    })
    setSubmitting(false)
    if (error) return toast.error('Could not post comment')
    setCommentText('')
    toast.success('Comment posted!')
    loadComments()
  }

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
          <Avatar
            src={profile.photos?.[0]}
            name={profile.name}
            size="xl"
            className="border-4 border-brand-500"
          />
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

        {/* WhatsApp */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'rgba(37,211,102,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Phone size={17} color="#25d366" />
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>WhatsApp</p>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 15, marginTop: 1 }}>
                {waUnlocked ? (profile.whatsapp || 'Not set') : '••••••••••'}
              </p>
            </div>
          </div>
          {!waUnlocked && (
            <button
              onClick={() => setShowWaModal(true)}
              style={{
                background: '#25d366', border: 'none', borderRadius: 12,
                padding: '9px 14px', color: 'white', fontWeight: 800,
                fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Lock size={12} /> KSh {WHATSAPP_UNLOCK_AMOUNT}
            </button>
          )}
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

        {/* Comments */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle size={16} color="rgba(255,255,255,0.5)" />
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 700 }}>Comments ({comments.length})</span>
          </div>

          {/* Comment list */}
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {comments.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No comments yet. Be the first!</p>
            ) : comments.map(c => (
              <div key={c.id} style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(244,63,94,0.2)',
                  overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {c.commenter?.photos?.[0]
                    ? <img src={c.commenter.photos[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : <span style={{ color: '#fb7185', fontSize: 13, fontWeight: 800 }}>{c.commenter?.name?.[0] || '?'}</span>
                  }
                </div>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{c.commenter?.name || 'User'}</p>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.5 }}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Post comment */}
          <div style={{ padding: '12px 18px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (commentUnlocked ? handlePostComment() : setShowCommentModal(true))}
              placeholder="Write a comment..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '10px 14px',
                color: 'white', fontSize: 13, outline: 'none',
              }}
            />
            <button
              onClick={() => commentUnlocked ? handlePostComment() : setShowCommentModal(true)}
              disabled={submitting}
              style={{
                width: 38, height: 38, borderRadius: 12, border: 'none',
                background: commentUnlocked ? '#f43f5e' : 'rgba(255,255,255,0.1)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {commentUnlocked
                ? <Send size={15} color="white" />
                : <Lock size={14} color="rgba(255,255,255,0.5)" />
              }
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button size="full" variant="secondary" onClick={() => navigate(ROUTES.SUPPORT)}>
            <Heart size={16} /> Support the Creator
          </Button>
          <Button size="full" variant="ghost" onClick={signOut}>
            <LogOut size={16} /> Sign Out
          </Button>
        </div>
      </div>

      {/* WhatsApp Unlock Modal */}
      <Modal isOpen={showWaModal} onClose={() => setShowWaModal(false)} title="Unlock WhatsApp">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingBottom: 8 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'rgba(37,211,102,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Phone size={28} color="#25d366" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>View WhatsApp Number</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>Pay once to reveal this person's contact</p>
          </div>
          <div style={{
            width: '100%', background: 'rgba(255,255,255,0.05)',
            borderRadius: 16, padding: '16px', textAlign: 'center',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>One-time unlock fee</p>
            <p style={{ color: '#25d366', fontWeight: 900, fontSize: 32, marginTop: 4 }}>KSh {WHATSAPP_UNLOCK_AMOUNT}</p>
          </div>
          <button
            onClick={() => {
              setShowWaModal(false)
              payWhatsappUnlock({
                targetUserId: profile.id,
                onSuccess: async (ref) => {
                  await supabase.from('whatsapp_unlocks').insert({
                    user_id: profile.id,
                    profile_id: profile.id,
                    reference: ref,
                  })
                  setWaUnlocked(true)
                  toast.success('WhatsApp unlocked! 🎉')
                },
                onClose: () => toast('Payment cancelled'),
              })
            }}
            style={{
              width: '100%', background: '#25d366', border: 'none',
              borderRadius: 14, padding: '15px',
              color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(37,211,102,0.3)',
            }}
          >
            Pay KSh {WHATSAPP_UNLOCK_AMOUNT} & Unlock
          </button>
          <button onClick={() => setShowWaModal(false)} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </Modal>

      {/* Comment Unlock Modal */}
      <Modal isOpen={showCommentModal} onClose={() => setShowCommentModal(false)} title="Post a Comment">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingBottom: 8 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'rgba(244,63,94,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageCircle size={28} color="#f43f5e" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Unlock Commenting</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>Pay once to post comments on any profile</p>
          </div>
          <div style={{
            width: '100%', background: 'rgba(255,255,255,0.05)',
            borderRadius: 16, padding: '16px', textAlign: 'center',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>One-time unlock fee</p>
            <p style={{ color: '#f43f5e', fontWeight: 900, fontSize: 32, marginTop: 4 }}>KSh {COMMENT_UNLOCK_AMOUNT}</p>
          </div>
          <button
            onClick={() => {
              setShowCommentModal(false)
              payCommentUnlock({
                targetUserId: profile.id,
                onSuccess: async (ref) => {
                  await supabase.from('comment_unlocks').insert({
                    user_id: profile.id,
                    profile_id: profile.id,
                    reference: ref,
                  })
                  setCommentUnlocked(true)
                  toast.success('Commenting unlocked! 🎉')
                },
                onClose: () => toast('Payment cancelled'),
              })
            }}
            style={{
              width: '100%', background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
              border: 'none', borderRadius: 14, padding: '15px',
              color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(244,63,94,0.3)',
            }}
          >
            Pay KSh {COMMENT_UNLOCK_AMOUNT} & Comment
          </button>
          <button onClick={() => setShowCommentModal(false)} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </Modal>
    </PageWrapper>
  )
}

export default Profile
