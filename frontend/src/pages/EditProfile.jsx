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
import { INTERESTS, ROUTES, GENDERS, COURSES, YEARS } from '@/lib/constants'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  gender: z.enum(['Male', 'Female'], { message: 'Select your gender' }),
  age: z.coerce.number().min(18, 'Must be 18 or older').max(60, 'Enter a valid age'),
  location: z.string().min(2, 'Enter your location').max(50),
  course: z.string().min(1, 'Select your course'),
  year: z.string().min(1, 'Select your year'),
  bio: z.string().max(200, 'Bio must be under 200 characters').optional(),
  looking_for: z.string().max(300, 'Keep it under 300 characters').optional(),
  whatsapp: z.string()
    .min(10, 'Enter a valid WhatsApp number')
    .regex(/^(\+254|0)[17]\d{8}$/, 'Enter a valid Kenyan number e.g. 0712345678'),
})

const inputStyle = (error) => ({
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  border: error ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: '13px 14px',
  color: 'white',
  fontSize: 14,
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
  fontFamily: 'inherit',
})

const EditProfile = () => {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState(profile?.photos || [])
  const [interests, setInterests] = useState(profile?.interests || [])
  const [bioLen, setBioLen] = useState((profile?.bio || '').length)
  const [lookingForLen, setLookingForLen] = useState((profile?.looking_for || '').length)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name || '',
      gender: profile?.gender || '',
      age: profile?.age || '',
      location: profile?.location || '',
      course: profile?.course || '',
      year: profile?.year || '',
      bio: profile?.bio || '',
      looking_for: profile?.looking_for || '',
      whatsapp: profile?.whatsapp || '',
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
    } catch (err) {
      console.error('Upload error:', err)
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (url) => setPhotos(prev => prev.filter(p => p !== url))

  const onSubmit = async ({ name, gender, age, location, course, year, bio, looking_for, whatsapp }) => {
    if (photos.length === 0) {
      toast.error('Please add at least one photo')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          gender,
          age,
          location: location.trim(),
          course,
          year,
          bio: bio?.trim(),
          looking_for: looking_for?.trim(),
          whatsapp: whatsapp.trim(),
          photos,
          interests,
        })
        .eq('id', profile.id)
      if (error) throw error
      await refreshProfile()
      toast.success('Profile updated!')
      navigate(ROUTES.DISCOVER)
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
        <span style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>Complete Profile</span>
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

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 18px 100px' }}>

        <Section label={`Photos (${photos.length}/4)`} hint="Required — add at least 1 photo">
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

        <Section label="Full Name" hint="Your real name">
          <input type="text" placeholder="Your name"
            style={inputStyle(errors.name)} {...register('name')} />
          {errors.name && <Err msg={errors.name.message} />}
        </Section>

        <Section label="Gender" hint="Select your gender">
          <select style={{ ...inputStyle(errors.gender), color: 'rgba(255,255,255,0.85)' }} {...register('gender')}>
            <option value="" style={{ background: '#111' }}>Select gender</option>
            {GENDERS.map(g => <option key={g} value={g} style={{ background: '#111' }}>{g}</option>)}
          </select>
          {errors.gender && <Err msg={errors.gender.message} />}
        </Section>

        <Section label="Age & Location" hint="Your age and where you stay">
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input type="number" min="18" max="60" placeholder="Age"
                style={inputStyle(errors.age)} {...register('age')} />
              {errors.age && <Err msg={errors.age.message} />}
            </div>
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input type="text" placeholder="e.g. Kakamega, Hostel B"
                style={inputStyle(errors.location)} {...register('location')} />
              {errors.location && <Err msg={errors.location.message} />}
            </div>
          </div>
        </Section>

        <Section label="Course" hint="Your current course">
          <select style={{ ...inputStyle(errors.course), color: 'rgba(255,255,255,0.85)' }} {...register('course')}>
            <option value="" style={{ background: '#111' }}>Select course</option>
            {COURSES.map(c => <option key={c} value={c} style={{ background: '#111' }}>{c}</option>)}
          </select>
          {errors.course && <Err msg={errors.course.message} />}
        </Section>

        <Section label="Year of Study" hint="Your current year">
          <select style={{ ...inputStyle(errors.year), color: 'rgba(255,255,255,0.85)' }} {...register('year')}>
            <option value="" style={{ background: '#111' }}>Select year</option>
            {YEARS.map(y => <option key={y} value={y} style={{ background: '#111' }}>{y}</option>)}
          </select>
          {errors.year && <Err msg={errors.year.message} />}
        </Section>

        <Section label="WhatsApp Number" hint="Required — kept private until unlocked">
          <input type="tel" placeholder="e.g. 0712345678"
            style={inputStyle(errors.whatsapp)} {...register('whatsapp')} />
          {errors.whatsapp && <Err msg={errors.whatsapp.message} />}
        </Section>

        <Section label="Bio" hint="Tell people about yourself (optional)">
          <div style={{ position: 'relative' }}>
            <textarea
              placeholder="What makes you interesting? Your vibe, hobbies..."
              rows={4}
              maxLength={200}
              style={{
                ...inputStyle(errors.bio),
                lineHeight: 1.6,
                resize: 'none',
              }}
              {...register('bio', { onChange: (e) => setBioLen(e.target.value.length) })}
            />
            <span style={{
              position: 'absolute', bottom: 10, right: 14,
              fontSize: 11, color: bioLen > 180 ? '#f87171' : 'rgba(255,255,255,0.25)',
            }}>{bioLen}/200</span>
          </div>
          {errors.bio && <Err msg={errors.bio.message} />}
        </Section>

        <Section label="Looking For" hint="Describe your ideal person (optional)">
          <div style={{ position: 'relative' }}>
            <textarea
              placeholder="Describe who you are looking for — personality, hobbies, values..."
              rows={4}
              maxLength={300}
              style={{
                ...inputStyle(errors.looking_for),
                lineHeight: 1.6,
                resize: 'none',
              }}
              {...register('looking_for', { onChange: (e) => setLookingForLen(e.target.value.length) })}
            />
            <span style={{
              position: 'absolute', bottom: 10, right: 14,
              fontSize: 11, color: lookingForLen > 270 ? '#f87171' : 'rgba(255,255,255,0.25)',
            }}>{lookingForLen}/300</span>
          </div>
          {errors.looking_for && <Err msg={errors.looking_for.message} />}
        </Section>

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

const Err = ({ msg }) => (
  <span style={{ color: '#f87171', fontSize: 12, marginTop: 4, display: 'block' }}>{msg}</span>
)

export default EditProfile
