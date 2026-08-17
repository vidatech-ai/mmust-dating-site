import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { useConversations } from '@/hooks/useChat'
import PageWrapper from '@/components/layout/PageWrapper'
import TopBar from '@/components/layout/TopBar'
import Avatar from '@/components/ui/Avatar'
import Spinner from '@/components/ui/Spinner'

const ConversationItem = ({ conversation, currentUserId, onClick }) => {
  const other =
    conversation.user1_id === currentUserId
      ? conversation.user2
      : conversation.user1

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 active:bg-white/10 cursor-pointer"
    >
      <Avatar
        src={other?.photos?.[0]}
        name={other?.name}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-white font-semibold text-sm">{other?.name}</p>
          {conversation.last_message_at && (
            <span className="text-white/30 text-xs">
              {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
            </span>
          )}
        </div>
        <p className="text-white/40 text-sm truncate mt-0.5">
          {conversation.last_message || 'Say hello!'}
        </p>
      </div>
    </motion.div>
  )
}

const Chat = () => {
  const { user } = useAuth()
  const { conversations, loading } = useConversations()
  const navigate = useNavigate()

  return (
    <PageWrapper>
      <TopBar title="Messages" />

      <div className="px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <Spinner />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <MessageCircle size={36} className="text-white/20" />
            </div>
            <p className="text-white/40 text-center">
              No conversations yet.<br />Unlock a chat from Discover!
            </p>
          </div>
        ) : (
          conversations.map(conv => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              currentUserId={user.id}
              onClick={() => navigate(`/chat/${conv.id}`)}
            />
          ))
        )}
      </div>
    </PageWrapper>
  )
}

export default Chat