import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Camera, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { INTERESTS, ROUTES } from '@/lib/constants'
import PageWrapper from '@/components/layout/PageWrapper'
import TopBar from '@/components/layout/TopBar'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const schema = z.object({
  bio: z.string().max(200, 'Bio must be under 200 characters').optional(),
})

const EditProfile = () => {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState(profile?.photos || [])
  const [interests, setInterests] = useState(profile?.interests || [])

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { bio: profile?.bio || '' },
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
        .from('photos')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('photos').getPublicUrl(path)
      setPhotos(prev => [...prev, data.publicUrl])
      toast.success('Photo uploaded!')
    } catch (err) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (url) => {
    setPhotos(prev => prev.filter(p => p !== url))
  }

  const onSubmit = async ({ bio }) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: bio?.trim(), photos, interests })
        .eq('id', profile.id)

      if (error) throw error
      refreshProfile()
      toast.success('Profile updated!')
      navigate(ROUTES.PROFILE)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper hideNav>
      <TopBar title="Edit Profile" showBack />

      <div className="px-4 py-6 flex flex-col gap-6">
        {/* Photos */}
        <div>
          <p className="text-white/60 text-xs uppercase tracking-wider mb-3">
            Photos ({photos.length}/4)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((url) => (
              <div key={url} className="relative aspect-square rounded-xl overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(url)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {photos.length < 4 && (
              <label className="aspect-square rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer">
                <Camera size={20} className="text-white/30" />
                <span className="text-white/30 text-xs mt-1">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* Bio */}
        <Input
          label="Bio (optional)"
          placeholder="Tell people about yourself..."
          error={errors.bio?.message}
          {...register('bio')}
        />

        {/* Interests */}
        <div>
          <p className="text-white/60 text-xs uppercase tracking-wider mb-3">
            Interests (pick up to 6)
          </p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(interest => (
              <motion.button
                key={interest}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleInterest(interest)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                  ${interests.includes(interest)
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/60'}
                `}
              >
                {interest}
              </motion.button>
            ))}
          </div>
        </div>

        <Button
          size="full"
          loading={loading || uploading}
          onClick={handleSubmit(onSubmit)}
        >
          Save Profile
        </Button>
      </div>
    </PageWrapper>
  )
}

export default EditProfile