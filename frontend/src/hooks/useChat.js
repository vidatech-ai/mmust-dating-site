import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export const useConversations = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchConversations()
  }, [user])

  const fetchConversations = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        user1_id,
        user2_id,
        last_message,
        last_message_at,
        user1:profiles!conversations_user1_id_fkey(id, name, photos),
        user2:profiles!conversations_user2_id_fkey(id, name, photos)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })

    if (!error) setConversations(data || [])
    setLoading(false)
  }

  return { conversations, loading, refetch: fetchConversations }
}

export const useMessages = (conversationId) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!conversationId) return
    fetchMessages()
    subscribeToMessages()
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [conversationId])

  const fetchMessages = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('id, content, sender_id, created_at, is_read')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (!error) setMessages(data || [])
    setLoading(false)
  }

  const subscribeToMessages = () => {
    channelRef.current = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
      })
      .subscribe()
  }

  const sendMessage = async (content) => {
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    })
    if (error) throw error

    await supabase
      .from('conversations')
      .update({ last_message: content, last_message_at: new Date().toISOString() })
      .eq('id', conversationId)
  }

  return { messages, loading, sendMessage }
}

export const useChatUnlock = () => {
  const { user } = useAuth()

  const checkUnlocked = async (otherUserId) => {
    const { data } = await supabase
      .from('chat_unlocks')
      .select('id')
      .eq('payer_id', user.id)
      .eq('target_id', otherUserId)
      .single()
    return !!data
  }

  const unlockChat = async (otherUserId, reference) => {
    const { error } = await supabase.from('chat_unlocks').insert({
      payer_id: user.id,
      target_id: otherUserId,
      payment_reference: reference,
    })
    if (error) throw error

    // create or get conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`
      )
      .single()

    if (!existing) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ user1_id: user.id, user2_id: otherUserId })
        .select('id')
        .single()
      return newConv.id
    }

    return existing.id
  }

  return { checkUnlocked, unlockChat }
}