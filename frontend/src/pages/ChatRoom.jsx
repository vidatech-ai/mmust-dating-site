import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { useMessages } from '@/hooks/useChat'
import { supabase } from '@/lib/supabase'
import PageWrapper from '@/components/layout/PageWrapper'
import TopBar from '@/components/layout/TopBar'
import Avatar from '@/components/ui/Avatar'
import Spinner from '@/components/ui/Spinner'

const Message = ({ message, isOwn }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`
        max-w-[75%] px-4 py-2.5 rounded-2xl text-sm
        ${isOwn
          ? 'bg-brand-500 text-white rounded-br-sm'
          : 'bg-white/10 text-white rounded-bl-sm'}
      `}
    >
      <p>{message.content}</p>
      <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/60' : 'text-white/40'}`}>
        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
      </p>
    </div>
  </div>
)

const ChatRoom = () => {
  const { userId: conversationId } = useParams()
  const { user } = useAuth()
  const { messages, loading, sendMessage } = useMessages(conversationId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [otherUser, setOtherUser] = useState(null)
  const bottomRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchOtherUser()
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchOtherUser = async () => {
    const { data: conv } = await supabase
      .from('conversations')
      .select(`
        user1_id, user2_id,
        user1:profiles!conversations_user1_id_fkey(id, name, photos),
        user2:profiles!conversations_user2_id_fkey(id, name, photos)
      `)
      .eq('id', conversationId)
      .single()

    if (conv) {
      setOtherUser(
        conv.user1_id === user.id ? conv.user2 : conv.user1
      )
    }
  }

  const handleSend = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await sendMessage(text.trim())
      setText('')
    } catch {
      // silently fail — message won't send
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <PageWrapper hideNav className="flex flex-col">
      <TopBar
        showBack
        title={otherUser?.name || 'Chat'}
        right={
          otherUser && (
            <Avatar
              src={otherUser.photos?.[0]}
              name={otherUser.name}
              size="sm"
            />
          )
        }
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <Spinner />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-16">
            <Avatar
              src={otherUser?.photos?.[0]}
              name={otherUser?.name}
              size="lg"
            />
            <p className="text-white font-semibold">{otherUser?.name}</p>
            <p className="text-white/40 text-sm">Say hello! 👋</p>
          </div>
        ) : (
          messages.map(msg => (
            <Message
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === user.id}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-[#111111] border-t border-white/5 safe-bottom">
        <div className="flex items-center gap-3">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-brand-500"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-11 h-11 rounded-full bg-brand-500 flex items-center justify-center disabled:opacity-40 shadow-lg shadow-brand-500/30"
          >
            <Send size={18} className="text-white" />
          </motion.button>
        </div>
      </div>
    </PageWrapper>
  )
}

export default ChatRoom