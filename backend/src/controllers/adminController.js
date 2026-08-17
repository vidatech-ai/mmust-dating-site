import supabaseAdmin from '../lib/supabaseAdmin.js'

export const getStats = async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: bannedUsers },
      { count: totalMessages },
      { count: totalUnlocks },
      { data: revenue },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
      supabaseAdmin.from('messages').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('chat_unlocks').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('support_payments').select('amount'),
    ])

    const totalRevenue = revenue?.reduce((sum, p) => sum + p.amount, 0) || 0

    return res.status(200).json({
      totalUsers: totalUsers || 0,
      bannedUsers: bannedUsers || 0,
      totalMessages: totalMessages || 0,
      totalUnlocks: totalUnlocks || 0,
      revenue: totalRevenue + ((totalUnlocks || 0) * 50),
    })
  } catch (err) {
    console.error('getStats error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch stats' })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, course, year, gender, is_banned, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return res.status(200).json(data)
  } catch (err) {
    console.error('getAllUsers error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch users' })
  }
}

export const banUser = async (req, res) => {
  const { userId } = req.params
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_banned: true })
      .eq('id', userId)

    if (error) throw error
    return res.status(200).json({ message: 'User banned' })
  } catch (err) {
    console.error('banUser error:', err.message)
    return res.status(500).json({ error: 'Failed to ban user' })
  }
}

export const unbanUser = async (req, res) => {
  const { userId } = req.params
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_banned: false })
      .eq('id', userId)

    if (error) throw error
    return res.status(200).json({ message: 'User unbanned' })
  } catch (err) {
    console.error('unbanUser error:', err.message)
    return res.status(500).json({ error: 'Failed to unban user' })
  }
}