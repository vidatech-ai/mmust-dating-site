import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Heart, X, SlidersHorizontal, MessageCircle, MapPin,
  GraduationCap, User, HeadphonesIcon, Download,
  Phone, Lock, Send,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useProfiles, useLikes } from '@/hooks/useProfiles'
import { useChatUnlock } from '@/hooks/useChat'
import { usePaystack } from '@/hooks/usePaystack'
import {
  COURSES, GENDERS, YEARS, ROUTES,
  WHATSAPP_UNLOCK_AMOUNT, COMMENT_UNLOCK_AMOUNT,
} from '@/lib/constants'
import TopBar from '@/components/layout/TopBar'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'

let deferredPrompt = null
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
})

// ── Bottom Nav ────────────────────────────────────────────────────────────────
const BottomNav = ({ navigate }) => {
  const path = window.location.pathname
  const items = [
    { icon: Heart,          label: 'Discover', route: ROUTES.DISCOVER },
    { icon: MessageCircle,  label: 'Chats',    route: ROUTES.CHAT },
    { icon: User,           label: 'Profile',  route: ROUTES.PROFILE },
    { icon: HeadphonesIcon, label: 'Support',  route: ROUTES.SUPPORT },
  ]
  return (
    <div style={{
      position:'fixed', bottom:0, left:0, right:0,
      background:'rgba(10,10,10,0.96)', backdropFilter:'blur(16px)',
      borderTop:'1px solid rgba(255,255,255,0.07)',
      display:'flex', zIndex:50,
      paddingBottom:'env(safe-area-inset-bottom)',
    }}>
      {items.map(({ icon: Icon, label, route }) => {
        const active = path === route
        return (
          <button key={route} onClick={() => navigate(route)} style={{
            flex:1, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            padding:'10px 0', background:'none', border:'none', cursor:'pointer', gap:4,
          }}>
            <Icon size={20} color={active ? '#f43f5e' : 'rgba(255,255,255,0.35)'}
              fill={active && label === 'Discover' ? '#f43f5e' : 'none'} />
            <span style={{ color: active ? '#f43f5e' : 'rgba(255,255,255,0.3)', fontSize:10, fontWeight: active ? 700 : 500 }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ── PWA Install Button ────────────────────────────────────────────────────────
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
    if (outcome === 'accepted') { deferredPrompt = null; setVisible(false) }
  }
  return (
    <button onClick={handleInstall} style={{
      position:'fixed', bottom:70, right:16,
      background:'rgba(244,63,94,0.15)', border:'1px solid rgba(244,63,94,0.3)',
      borderRadius:20, padding:'8px 14px',
      display:'flex', alignItems:'center', gap:6,
      color:'#fb7185', fontSize:12, fontWeight:700, cursor:'pointer', zIndex:49,
      backdropFilter:'blur(12px)',
    }}>
      <Download size={13} /> Install App
    </button>
  )
}

// ── Preferences Drawer ────────────────────────────────────────────────────────
const PreferencesDrawer = ({ isOpen, onClose, filters, setFilters, onApply }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Who are you looking for?">
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {[
        { label:'Gender', key:'gender', opts:['',...GENDERS],  labels:['Everyone',...GENDERS] },
        { label:'Course', key:'course', opts:['',...COURSES],   labels:['Any',...COURSES] },
        { label:'Year',   key:'year',   opts:['',...YEARS],     labels:['Any',...YEARS] },
      ].map(({ label, key, opts, labels }) => (
        <div key={key} style={{ display:'flex', flexDirection:'column', gap:5 }}>
          <label style={{ color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600 }}>{label}</label>
          <select value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
            style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'11px 13px', color:'white', fontSize:14, outline:'none' }}>
            {opts.map((o, i) => <option key={o} value={o} style={{ background:'#111' }}>{labels[i]}</option>)}
          </select>
        </div>
      ))}
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        <label style={{ color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600 }}>Age range</label>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <input type="number" min={18} max={60} placeholder="Min" value={filters.minAge}
            onChange={e => setFilters(f => ({ ...f, minAge: e.target.value }))}
            style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'11px 13px', color:'white', fontSize:14, outline:'none' }} />
          <span style={{ color:'rgba(255,255,255,0.3)' }}>–</span>
          <input type="number" min={18} max={60} placeholder="Max" value={filters.maxAge}
            onChange={e => setFilters(f => ({ ...f, maxAge: e.target.value }))}
            style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'11px 13px', color:'white', fontSize:14, outline:'none' }} />
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        <label style={{ color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600 }}>Location</label>
        <input type="text" placeholder="e.g. Kakamega, Hostel B..." value={filters.location}
          onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
          style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'11px 13px', color:'white', fontSize:14, outline:'none' }} />
      </div>
      <Button size="full" onClick={onApply}>Apply Filters</Button>
    </div>
  </Modal>
)

// ── Reusable Action Button ────────────────────────────────────────────────────
const Btn = ({ onClick, size, primary, waActive, locked, children }) => (
  <motion.button whileTap={{ scale:0.87 }} onClick={onClick} style={{
    width:size, height:size, borderRadius:'50%', border:'none',
    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
    position:'relative', flexShrink:0,
    background: primary ? '#f43f5e' : waActive ? 'rgba(37,211,102,0.18)' : 'rgba(255,255,255,0.13)',
    backdropFilter: primary ? 'none' : 'blur(16px)',
    WebkitBackdropFilter: primary ? 'none' : 'blur(16px)',
    boxShadow: primary ? '0 8px 28px rgba(244,63,94,0.45)' : waActive ? '0 4px 16px rgba(37,211,102,0.2)' : 'none',
    outline: waActive ? '1px solid rgba(37,211,102,0.35)' : '1px solid rgba(255,255,255,0.12)',
  }}>
    {children}
    {locked && (
      <span style={{
        position:'absolute', bottom:5, right:5,
        background:'rgba(0,0,0,0.65)', borderRadius:'50%',
        width:14, height:14, display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <Lock size={8} color="rgba(255,255,255,0.8)" />
      </span>
    )}
  </motion.button>
)

// ── Info Box ──────────────────────────────────────────────────────────────────
const InfoBox = ({ label, children }) => (
  <div style={{
    background:'rgba(0,0,0,0.55)',
    backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
    border:'1px solid rgba(255,255,255,0.13)',
    borderRadius:14, padding:'10px 13px',
  }}>
    <p style={{ margin:'0 0 5px', color:'rgba(255,255,255,0.38)', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em' }}>{label}</p>
    {children}
  </div>
)

// ── Profile Slide ─────────────────────────────────────────────────────────────
const ProfileSlide = ({ profile, onLike, onMessage, onWhatsapp, onComment, waUnlocked, commentUnlocked }) => (
  <div className="snap-start" style={{ height:'calc(100dvh - 56px - 58px)', position:'relative', flexShrink:0, overflow:'hidden' }}>

    {/* CRYSTAL-CLEAR FULL PHOTO — no clipping */}
    {profile.photos?.length > 0 ? (
      <img
        src={profile.photos[0]}
        alt={profile.name}
        style={{
          position:'absolute', inset:0,
          width:'100%', height:'100%',
          objectFit:'cover',
          objectPosition:'center top',
          display:'block',
        }}
      />
    ) : (
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.03)' }}>
        <Avatar name={profile.name} size="xl" />
      </div>
    )}

    {/* Gradient — bottom half only so top photo stays clear */}
    <div style={{
      position:'absolute', inset:0, pointerEvents:'none',
      background:'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.78) 28%, rgba(0,0,0,0.12) 54%, transparent 70%)',
    }} />

    {/* Info Panel — proper boxes, never squeezed */}
    <div style={{ position:'absolute', bottom:84, left:0, right:0, padding:'0 14px', display:'flex', flexDirection:'column', gap:7 }}>

      {/* Name + Age */}
      <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
        <h2 style={{ margin:0, color:'white', fontSize:27, fontWeight:800, lineHeight:1.1 }}>{profile.name}</h2>
        {profile.age && <span style={{ color:'rgba(255,255,255,0.65)', fontSize:19, fontWeight:500 }}>{profile.age}</span>}
      </div>

      {/* Course + Location */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
        <span style={{ color:'rgba(255,255,255,0.55)', fontSize:12, display:'flex', alignItems:'center', gap:3 }}>
          <GraduationCap size={11} /> {profile.course} · {profile.year}
        </span>
        {profile.location && (
          <span style={{ color:'rgba(255,255,255,0.55)', fontSize:12, display:'flex', alignItems:'center', gap:3 }}>
            <MapPin size={11} /> {profile.location}
          </span>
        )}
      </div>

      {/* Bio Box */}
      {profile.bio && (
        <InfoBox label="About me">
          <p style={{ margin:0, color:'rgba(255,255,255,0.92)', fontSize:13, lineHeight:1.55 }}>{profile.bio}</p>
        </InfoBox>
      )}

      {/* Hobbies Box */}
      {profile.interests?.length > 0 && (
        <InfoBox label="Hobbies & Interests">
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {profile.interests.slice(0, 8).map(i => (
              <span key={i} style={{
                background:'rgba(244,63,94,0.18)', border:'1px solid rgba(244,63,94,0.32)',
                borderRadius:20, padding:'3px 10px', color:'#fb7185', fontSize:11, fontWeight:600,
              }}>{i}</span>
            ))}
          </div>
        </InfoBox>
      )}

      {/* Looking For Box */}
      {profile.looking_for && (
        <InfoBox label="Looking For">
          <p style={{ margin:0, color:'rgba(255,255,255,0.92)', fontSize:13, lineHeight:1.5 }}>{profile.looking_for}</p>
        </InfoBox>
      )}
    </div>

    {/* Action Buttons */}
    <div style={{ position:'absolute', bottom:14, left:0, right:0, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
      <Btn size={50} onClick={() => onLike(profile.id, false)}>
        <X size={20} color="rgba(255,255,255,0.75)" />
      </Btn>
      <Btn size={50} onClick={() => onComment(profile)} locked={!commentUnlocked}>
        <MessageCircle size={18} color={commentUnlocked ? '#60a5fa' : 'rgba(255,255,255,0.55)'} />
      </Btn>
      <Btn size={66} primary onClick={() => onLike(profile.id, true)}>
        <Heart size={27} color="white" fill="white" />
      </Btn>
      <Btn size={50} onClick={() => onMessage(profile)}>
        <Send size={17} color="#60a5fa" />
      </Btn>
      <Btn size={50} onClick={() => onWhatsapp(profile)} locked={!waUnlocked} waActive={waUnlocked}>
        <Phone size={18} color={waUnlocked ? '#25d366' : 'rgba(255,255,255,0.55)'} />
      </Btn>
    </div>
  </div>
)

// ── Chat Unlock Modal ─────────────────────────────────────────────────────────
const ChatUnlockModal = ({ isOpen, onClose, profile, onPay }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Unlock Chat">
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, paddingBottom:8 }}>
      <Avatar src={profile?.photos?.[0]} name={profile?.name} size="lg" />
      <div style={{ textAlign:'center' }}>
        <p style={{ color:'white', fontWeight:700, fontSize:16, margin:0 }}>{profile?.name}</p>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, margin:'4px 0 0' }}>{profile?.course}</p>
      </div>
      <div style={{ width:'100%', background:'rgba(255,255,255,0.05)', borderRadius:16, padding:16, textAlign:'center' }}>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, margin:0 }}>One-time fee to start chatting</p>
        <p style={{ color:'#f43f5e', fontWeight:900, fontSize:32, margin:'4px 0 0' }}>KSh 50</p>
      </div>
      <Button size="full" onClick={onPay}>Pay & Unlock Chat</Button>
      <button onClick={onClose} style={{ color:'rgba(255,255,255,0.3)', fontSize:13, background:'none', border:'none', cursor:'pointer' }}>Cancel</button>
    </div>
  </Modal>
)

// ── WhatsApp Modal ────────────────────────────────────────────────────────────
const WhatsAppModal = ({ isOpen, onClose, profile, unlocked, onPay }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={unlocked ? 'WhatsApp Contact' : 'Unlock WhatsApp'}>
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, paddingBottom:8 }}>
      <div style={{ width:64, height:64, borderRadius:20, background:'rgba(37,211,102,0.13)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Phone size={28} color="#25d366" />
      </div>
      {unlocked ? (
        <>
          <div style={{ textAlign:'center' }}>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:12, margin:0 }}>{profile?.name}&apos;s WhatsApp</p>
            <p style={{ color:'white', fontWeight:900, fontSize:26, margin:'8px 0 0', letterSpacing:'0.03em' }}>
              {profile?.whatsapp || 'Not provided'}
            </p>
          </div>
          {profile?.whatsapp && (
            <a
              href={`https://wa.me/${(profile.whatsapp || '').replace(/[^0-9]/g, '')}`}
              target="_blank" rel="noreferrer"
              style={{ width:'100%', background:'#25d366', border:'none', borderRadius:14, padding:15, color:'white', fontWeight:800, fontSize:15, cursor:'pointer', display:'block', textAlign:'center', textDecoration:'none', boxShadow:'0 8px 24px rgba(37,211,102,0.35)' }}
            >
              Open in WhatsApp
            </a>
          )}
          <button onClick={onClose} style={{ color:'rgba(255,255,255,0.3)', fontSize:13, background:'none', border:'none', cursor:'pointer' }}>Close</button>
        </>
      ) : (
        <>
          <div style={{ textAlign:'center' }}>
            <p style={{ color:'white', fontWeight:700, fontSize:16, margin:0 }}>View {profile?.name}&apos;s Number</p>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, margin:'4px 0 0' }}>Session-only · resets after logout</p>
          </div>
          <div style={{ width:'100%', background:'rgba(255,255,255,0.05)', borderRadius:16, padding:16, textAlign:'center' }}>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, margin:0 }}>Unlock fee</p>
            <p style={{ color:'#25d366', fontWeight:900, fontSize:32, margin:'4px 0 0' }}>KSh {WHATSAPP_UNLOCK_AMOUNT}</p>
          </div>
          <button onClick={onPay} style={{ width:'100%', background:'#25d366', border:'none', borderRadius:14, padding:15, color:'white', fontWeight:800, fontSize:15, cursor:'pointer', boxShadow:'0 8px 24px rgba(37,211,102,0.3)' }}>
            Pay KSh {WHATSAPP_UNLOCK_AMOUNT} & View Number
          </button>
          <button onClick={onClose} style={{ color:'rgba(255,255,255,0.3)', fontSize:13, background:'none', border:'none', cursor:'pointer' }}>Cancel</button>
        </>
      )}
    </div>
  </Modal>
)

// ── Comment Modal ─────────────────────────────────────────────────────────────
const CommentModal = ({ isOpen, onClose, profile, unlocked, onPay, currentUserId }) => {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && profile && unlocked) loadComments()
  }, [isOpen, profile?.id, unlocked])

  const loadComments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profile_comments')
      .select('id, text, created_at, commenter:profiles!profile_comments_commenter_id_fkey(name, photos)')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
    setComments(data || [])
    setLoading(false)
  }

  const handlePost = async () => {
    if (!text.trim() || submitting) return
    setSubmitting(true)
    const { error } = await supabase.from('profile_comments').insert({
      profile_id: profile.id,
      commenter_id: currentUserId,
      text: text.trim(),
    })
    setSubmitting(false)
    if (error) return toast.error('Could not post comment')
    setText('')
    toast.success('Comment posted!')
    loadComments()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={profile ? `${profile.name}'s Comments` : 'Comments'}>
      {!unlocked ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, paddingBottom:8 }}>
          <div style={{ width:64, height:64, borderRadius:20, background:'rgba(244,63,94,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <MessageCircle size={28} color="#f43f5e" />
          </div>
          <div style={{ textAlign:'center' }}>
            <p style={{ color:'white', fontWeight:700, fontSize:16, margin:0 }}>Unlock Commenting</p>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, margin:'4px 0 0' }}>
              Pay to comment on {profile?.name}&apos;s profile · resets after logout
            </p>
          </div>
          <div style={{ width:'100%', background:'rgba(255,255,255,0.05)', borderRadius:16, padding:16, textAlign:'center' }}>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, margin:0 }}>Unlock fee</p>
            <p style={{ color:'#f43f5e', fontWeight:900, fontSize:32, margin:'4px 0 0' }}>KSh {COMMENT_UNLOCK_AMOUNT}</p>
          </div>
          <button onClick={onPay} style={{ width:'100%', background:'linear-gradient(135deg,#f43f5e,#e11d48)', border:'none', borderRadius:14, padding:15, color:'white', fontWeight:800, fontSize:15, cursor:'pointer', boxShadow:'0 8px 24px rgba(244,63,94,0.3)' }}>
            Pay KSh {COMMENT_UNLOCK_AMOUNT} & Comment
          </button>
          <button onClick={onClose} style={{ color:'rgba(255,255,255,0.3)', fontSize:13, background:'none', border:'none', cursor:'pointer' }}>Cancel</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          <div style={{ maxHeight:300, overflowY:'auto', marginBottom:12 }}>
            {loading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:'24px 0' }}><Spinner /></div>
            ) : comments.length === 0 ? (
              <p style={{ color:'rgba(255,255,255,0.25)', fontSize:13, textAlign:'center', padding:'24px 0', margin:0 }}>No comments yet — be the first!</p>
            ) : comments.map(c => (
              <div key={c.id} style={{ display:'flex', gap:10, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, background:'rgba(244,63,94,0.18)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {c.commenter?.photos?.[0]
                    ? <img src={c.commenter.photos[0]} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" />
                    : <span style={{ color:'#fb7185', fontSize:13, fontWeight:800 }}>{c.commenter?.name?.[0] || '?'}</span>
                  }
                </div>
                <div>
                  <p style={{ color:'rgba(255,255,255,0.55)', fontSize:11, fontWeight:700, margin:'0 0 3px' }}>{c.commenter?.name || 'User'}</p>
                  <p style={{ color:'rgba(255,255,255,0.9)', fontSize:13, lineHeight:1.5, margin:0 }}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePost()}
              placeholder="Write a comment..."
              style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'10px 13px', color:'white', fontSize:13, outline:'none' }}
            />
            <button onClick={handlePost} disabled={submitting || !text.trim()} style={{ width:40, height:40, borderRadius:12, border:'none', background:'#f43f5e', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, opacity:(!text.trim() || submitting) ? 0.4 : 1 }}>
              <Send size={15} color="white" />
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ── Main Discover ─────────────────────────────────────────────────────────────
const Discover = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { payWhatsappUnlock, payCommentUnlock, payChatUnlock } = usePaystack()
  const { likeProfile } = useLikes()
  const { checkUnlocked, unlockChat } = useChatUnlock()

  const [filters, setFilters] = useState({ gender:'', course:'', year:'', location:'', minAge:'', maxAge:'' })
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Chat unlock
  const [chatTarget, setChatTarget] = useState(null)

  // WhatsApp — session state only (resets on logout / refresh)
  const [waUnlocked, setWaUnlocked] = useState({})
  const [waTarget, setWaTarget] = useState(null)

  // Comments — session state per profile
  const [commentUnlocked, setCommentUnlocked] = useState({})
  const [commentTarget, setCommentTarget] = useState(null)

  const { profiles, loading, loadingMore, hasMore, fetchMore } = useProfiles(filters)

  const observerRef = useRef(null)
  const sentinelRef = useCallback(node => {
    if (loading) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) fetchMore()
    }, { rootMargin:'800px', threshold:0 })
    if (node) observerRef.current.observe(node)
  }, [loading, hasMore, fetchMore])

  useEffect(() => () => observerRef.current?.disconnect(), [])

  const handleLike = async (profileId, liked) => {
    if (!liked) return
    try { await likeProfile(profileId); toast.success('Liked! 💕') }
    catch { toast.error('Something went wrong') }
  }

  const handleMessage = async (profile) => {
    const already = await checkUnlocked(profile.id)
    if (already) navigate(`/chat/${profile.id}`)
    else setChatTarget(profile)
  }

  const handleChatPay = () => {
    payChatUnlock({
      targetUserId: chatTarget.id,
      onSuccess: async (reference) => {
        try {
          const convId = await unlockChat(chatTarget.id, reference)
          toast.success('Chat unlocked! 🎉')
          setChatTarget(null)
          navigate(`/chat/${convId}`)
        } catch { toast.error('Payment verified but unlock failed. Contact support.') }
      },
      onClose: () => toast('Payment cancelled'),
    })
  }

  const handleWhatsapp = (profile) => setWaTarget(profile)

  const handleWaPay = () => {
    payWhatsappUnlock({
      targetUserId: waTarget.id,
      onSuccess: async (ref) => {
        // Audit trail in Supabase
        supabase.from('whatsapp_unlocks').insert({ user_id: user.id, profile_id: waTarget.id, reference: ref })
        // Session-only unlock — cleared on logout
        setWaUnlocked(prev => ({ ...prev, [waTarget.id]: true }))
        toast.success('WhatsApp unlocked! 🎉')
        // keep modal open so number is visible immediately
      },
      onClose: () => toast('Payment cancelled'),
    })
  }

  const handleComment = (profile) => setCommentTarget(profile)

  const handleCommentPay = () => {
    payCommentUnlock({
      targetUserId: commentTarget.id,
      onSuccess: async (ref) => {
        supabase.from('comment_unlocks').insert({ user_id: user.id, profile_id: commentTarget.id, reference: ref })
        setCommentUnlocked(prev => ({ ...prev, [commentTarget.id]: true }))
        toast.success('Commenting unlocked! 🎉')
      },
      onClose: () => toast('Payment cancelled'),
    })
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100dvh', background:'#0a0a0a' }}>
      <TopBar
        title="Discover"
        right={
          <button onClick={() => setDrawerOpen(true)} style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', color:'white' }}>
            <SlidersHorizontal size={16} />
          </button>
        }
      />

      {loading ? (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}><Spinner /></div>
      ) : profiles.length === 0 ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:'0 24px' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Heart size={36} color="rgba(255,255,255,0.15)" />
          </div>
          <p style={{ color:'rgba(255,255,255,0.4)', textAlign:'center', fontSize:15, lineHeight:1.6, margin:0 }}>
            No profiles match your preferences.<br />Try widening your filters.
          </p>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>Edit Preferences</Button>
        </div>
      ) : (
        <div style={{ flex:1, overflowY:'auto', scrollSnapType:'y mandatory', WebkitOverflowScrolling:'touch' }}>
          {profiles.map(profile => (
            <ProfileSlide
              key={profile.id}
              profile={profile}
              onLike={handleLike}
              onMessage={handleMessage}
              onWhatsapp={handleWhatsapp}
              onComment={handleComment}
              waUnlocked={!!waUnlocked[profile.id]}
              commentUnlocked={!!commentUnlocked[profile.id]}
            />
          ))}
          {hasMore && (
            <div ref={sentinelRef} style={{ height:'calc(100dvh - 56px - 58px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {loadingMore ? <Spinner /> : <span style={{ color:'rgba(255,255,255,0.2)', fontSize:12 }}>Loading more…</span>}
            </div>
          )}
          {!hasMore && profiles.length > 0 && (
            <div style={{ height:'30vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <p style={{ color:'rgba(255,255,255,0.2)', fontSize:12, margin:0 }}>You've seen everyone ✨</p>
            </div>
          )}
        </div>
      )}

      <PWAInstallButton />
      <BottomNav navigate={navigate} />

      <PreferencesDrawer
        isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}
        filters={filters} setFilters={setFilters} onApply={() => setDrawerOpen(false)}
      />
      <ChatUnlockModal
        isOpen={!!chatTarget} onClose={() => setChatTarget(null)}
        profile={chatTarget} onPay={handleChatPay}
      />
      <WhatsAppModal
        isOpen={!!waTarget} onClose={() => setWaTarget(null)}
        profile={waTarget} unlocked={!!waUnlocked[waTarget?.id]} onPay={handleWaPay}
      />
      <CommentModal
        isOpen={!!commentTarget} onClose={() => setCommentTarget(null)}
        profile={commentTarget} unlocked={!!commentUnlocked[commentTarget?.id]}
        onPay={handleCommentPay} currentUserId={user?.id}
      />
    </div>
  )
}

export default Discover
