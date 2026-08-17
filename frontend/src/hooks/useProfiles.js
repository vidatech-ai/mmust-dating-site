import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export const useProfiles = (filters = {}) => {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    fetchProfiles()
  }, [user, filters.gender, filters.course, filters.year])

  const fetchProfiles = async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('profiles')
        .select('id, name, bio, course, year, gender, interests, photos')
        .neq('id', user.id)
        .eq('is_banned', false)

      if (filters.gender) query = query.eq('gender', filters.gender)
      if (filters.course) query = query.eq('course', filters.course)
      if (filters.year) query = query.eq('year', filters.year)

      const { data, error: err } = await query.order('created_at', { ascending: false })
      if (err) throw err
      setProfiles(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { profiles, loading, error, refetch: fetchProfiles }
}

export const useProfile = (userId) => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, name, bio, course, year, gender, interests, photos')
        .eq('id', userId)
        .single()
      if (err) throw err
      setProfile(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { profile, loading, error }
}

export const useLikes = () => {
  const { user } = useAuth()

  const likeProfile = async (targetId) => {
    const { error } = await supabase
      .from('likes')
      .upsert({ liker_id: user.id, liked_id: targetId })
    if (error) throw error

    // check for mutual like
    const { data: mutual } = await supabase
      .from('likes')
      .select('id')
      .eq('liker_id', targetId)
      .eq('liked_id', user.id)
      .single()

    if (mutual) {
      // create match
      await supabase.from('matches').upsert({
        user1_id: user.id,
        user2_id: targetId,
      })
    }
  }

  const unlikeProfile = async (targetId) => {
    await supabase
      .from('likes')
      .delete()
      .eq('liker_id', user.id)
      .eq('liked_id', targetId)
  }

  const checkLiked = async (targetId) => {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('liker_id', user.id)
      .eq('liked_id', targetId)
      .single()
    return !!data
  }

  return { likeProfile, unlikeProfile, checkLiked }
}