import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Camera, X, ArrowLeft, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { INTERESTS, ROUTES } from '@/lib/constants'

const schema = z.object({
  bio: z.string().max(200, 'Bio must be under 200 characters').optional(),
  age: z.coerce.number().min(18, 'Must be 18 or older').max(60, 'Enter a valid age'),
  location: z.string().min(2, 'Enter your location').max(50),
})

const EditProfile = () => {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState(profile?.photos || [])
  const [interests, setInterests] = useState(profile?.interests || [])
  const [bioLen, setBioLen] = useState((profile?.bio || '').length)

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: profile?.bio || '',
      age: profile?.age || '',
      location: profile?.location || '',
    },
  })

  const toggleInterest = (interest) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : prev.length < 6 ? [...prev, interest] : prev
    )
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (photos.length >= 4) return toast.error('Max 4 photos allowed')
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${profile.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('photos').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('photos').getPublicUrl(path)
      setPhotos(prev => [...prev, data.publicUrl])
      toast.success('Photo uploaded!')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (url) => setPhotos(prev => prev.filter(p => p !== url))

  const onSubmit = async ({ bio, age, location }) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: bio?.trim(), age, location: location?.trim(), photos, interests })
        .eq('id', profile.id)
      if (error) throw error
      await refreshProfile()
      toast.success('Profile updated!')
      navigate(ROUTES.PROFILE)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #0f0f0f 0%, #1a0a0f 50%, #0f0f0f 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(15,15,15,0.85)',
        backdropFilter: 'blur(20px)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} color="white" />
        </button>

        <span style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>Edit Profile</span>

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={loading || uploading}
          style={{
            height: 38, padding: '0 16px', borderRadius: 12,
            background: loading || uploading ? 'rgba(244,63,94,0.4)' : '#f43f5e',
            border: 'none', color: 'white',
            fontWeight: 700, fontSize: 14,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 4px 16px rgba(244,63,94,0.3)',
            transition: 'background 0.2s',
          }}
        >
          {loading
            ? <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            : <><Check size={15} /> Save</>
          }
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 18px 100px' }}>

        {/* PHOTOS */}
        <Section label={`Photos (${photos.length}/4)`} hint="Add up to 4 photos">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {photos.map((url) => (
              <div key={url} style={{ position: 'relative', aspectRatio: '1', borderRadius: 16, overflow: 'hidden' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  onClick={() => removePhoto(url)}
                  style={{
                    position: 'absolute', top: 5, right: 5,
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.7)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={12} color="white" />
                </button>
              </div>
            ))}
            {photos.length < 4 && (
              <label style={{
                aspectRatio: '1', borderRadius: 16,
                background: 'rgba(255,255,255,0.04)',
                border: '2px dashed rgba(255,255,255,0.12)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: uploading ? 'not-allowed' : 'pointer',
                gap: 4,
              }}>
                {uploading
                  ? <svg style={{ animation: 'spin 1s linear infinite', width: 20, height: 20 }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="white" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  : <>
                      <Camera size={20} color="rgba(255,255,255,0.3)" />
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Add</span>
                    </>
                }
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            )}
          </div>
        </Section>

        {/* BIO */}
        <Section label="Bio" hint="Tell people about yourself (optional)">
          <div style={{ position: 'relative' }}>
            <textarea
              placeholder="What makes you interesting? Your vibe, hobbies, what you're looking for…"
              rows={4}
              maxLength={200}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)',
                border: errors.bio ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '14px 16px',
                color: 'white', fontSize: 14, lineHeight: 1.6,
                outline: 'none', resize: 'none',
                fontFamily: 'inherit',
              }}
              {...register('bio', {
                onChange: (e) => setBioLen(e.target.value.length)
              })}
            />
            <span style={{
              position: 'absolute', bottom: 10, right: 14,
              fontSize: 11, color: bioLen > 180 ? '#f87171' : 'rgba(255,255,255,0.25)',
            }}>
              {bioLen}/200
            </span>
          </div>
          {errors.bio && <span style={{ color: '#f87171', fontSize: 12 }}>{errors.bio.message}</span>}
        </Section>

        {/* AGE + LOCATION */}
        <Section label="About you" hint="Your age and where you're based">
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input
                type="number" min="18" max="60" placeholder="Age"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)',
                  border: errors.age ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14, padding: '13px 14px',
                  color: 'white', fontSize: 14, outline: 'none',
                }}
                {...register('age')}
              />
              {errors.age && <span style={{ color: '#f87171', fontSize: 12 }}>{errors.age.message}</span>}
            </div>
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input
                type="text" placeholder="Location, e.g. Kakamega"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)',
                  border: errors.location ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14, padding: '13px 14px',
                  color: 'white', fontSize: 14, outline: 'none',
                }}
                {...register('location')}
              />
              {errors.location && <span style={{ color: '#f87171', fontSize: 12 }}>{errors.location.message}</span>}
            </div>
          </div>
        </Section>

        {/* INTERESTS */}
        <Section label="Interests" hint={`Pick up to 6 · ${interests.length}/6 selected`}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {INTERESTS.map(interest => {
              const active = interests.includes(interest)
              return (
                <motion.button
                  key={interest}
                  type="button"
                  whileTap={{ scale: 0.93 }}
                  onClick={() => toggleInterest(interest)}
                  style={{
                    padding: '8px 14px', borderRadius: 999,
                    fontSize: 13, fontWeight: 600,
                    cursor: 'pointer',
                    border: active ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.1)',
                    background: active ? 'rgba(244,63,94,0.18)' : 'rgba(255,255,255,0.04)',
                    color: active ? '#fb7185' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.18s',
                  }}
                >
                  {interest}
                </motion.button>
              )
            })}
          </div>
        </Section>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const Section = ({ label, hint, children }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ marginBottom: 12 }}>
      <p style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{label}</p>
      {hint && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{hint}</p>}
    </div>
    {children}
  </div>
)

export default EditProfile
