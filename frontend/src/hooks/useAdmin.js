import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const useAdmin = () => {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchUsers()
  }, [])

  const fetchStats = async () => {
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: bannedUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', true)

    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })

    const { count: chatUnlocks } = await supabase
      .from('chat_unlocks')
      .select('*', { count: 'exact', head: true })

    const { count: waUnlocks } = await supabase
      .from('whatsapp_unlocks')
      .select('*', { count: 'exact', head: true })

    const { count: commentUnlocks } = await supabase
      .from('comment_unlocks')
      .select('*', { count: 'exact', head: true })

    const revenue =
      (chatUnlocks || 0) * 50 +
      (waUnlocks || 0) * 20 +
      (commentUnlocks || 0) * 10

    setStats({
      totalUsers: totalUsers || 0,
      bannedUsers: bannedUsers || 0,
      totalMessages: totalMessages || 0,
      totalUnlocks: (chatUnlocks || 0) + (waUnlocks || 0) + (commentUnlocks || 0),
      chatUnlocks: chatUnlocks || 0,
      waUnlocks: waUnlocks || 0,
      commentUnlocks: commentUnlocks || 0,
      revenue,
    })
  }

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, course, year, gender, is_banned, created_at')
      .order('created_at', { ascending: false })
    if (!error) setUsers(data || [])
    setLoading(false)
  }

  const banUser = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: true })
      .eq('id', userId)
    if (error) throw error
    await fetchUsers()
    await fetchStats()
  }

  const unbanUser = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: false })
      .eq('id', userId)
    if (error) throw error
    await fetchUsers()
    await fetchStats()
  }

  return { stats, users, loading, banUser, unbanUser, refetch: fetchUsers }
}
