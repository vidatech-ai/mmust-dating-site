import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

const PAGE_SIZE = 12

export const useProfiles = (filters = {}) => {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)
  const pageRef = useRef(0)
  const seenIds = useRef(new Set())

  const buildQuery = (page) => {
    let query = supabase
      .from('profiles')
      .select('id, name, bio, course, year, gender, age, location, interests, photos, looking_for, whatsapp')
      .neq('id', user.id)
      .eq('is_banned', false)

    if (filters.gender) query = query.eq('gender', filters.gender)
    if (filters.course) query = query.eq('course', filters.course)
    if (filters.year) query = query.eq('year', filters.year)
    if (filters.location) query = query.ilike('location', `%${filters.location}%`)
    if (filters.minAge) query = query.gte('age', filters.minAge)
    if (filters.maxAge) query = query.lte('age', filters.maxAge)

    return query
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
  }

  const fetchFirstPage = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    pageRef.current = 0
    seenIds.current = new Set()
    try {
      const { data, error: err } = await buildQuery(0)
      if (err) throw err
      const rows = data || []
      rows.forEach(r => seenIds.current.add(r.id))
      setProfiles(rows)
      setHasMore(rows.length === PAGE_SIZE)
      pageRef.current = 1
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, filters.gender, filters.course, filters.year, filters.location, filters.minAge, filters.maxAge])

  const fetchMore = useCallback(async () => {
    if (!user || loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const { data, error: err } = await buildQuery(pageRef.current)
      if (err) throw err
      const rows = (data || []).filter(r => !seenIds.current.has(r.id))
      rows.forEach(r => seenIds.current.add(r.id))
      setProfiles(prev => [...prev, ...rows])
      setHasMore((data || []).length === PAGE_SIZE)
      pageRef.current += 1
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingMore(false)
    }
  }, [user, loadingMore, hasMore, filters.gender, filters.course, filters.year, filters.location, filters.minAge, filters.maxAge])

  useEffect(() => {
    fetchFirstPage()
  }, [fetchFirstPage])

  return { profiles, loading, loadingMore, hasMore, fetchMore, refetch: fetchFirstPage }
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
        .select('id, name, bio, course, year, gender, age, location, interests, photos, looking_for, whatsapp')
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
    const { data: mutual } = await supabase
      .from('likes')
      .select('id')
      .eq('liker_id', targetId)
      .eq('liked_id', user.id)
      .single()
    if (mutual) {
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
