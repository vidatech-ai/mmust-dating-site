import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/lib/constants'
import Spinner from '@/components/ui/Spinner'

export const isProfileComplete = (profile) => {
  if (!profile) return false
  const requiredText = ['name', 'course', 'year', 'gender', 'location']
  const hasText = requiredText.every(f => profile[f] && String(profile[f]).trim() !== '')
  const hasAge = profile.age !== null && profile.age !== undefined && profile.age !== ''
  const hasInterest = Array.isArray(profile.interests) && profile.interests.length > 0
  const hasPhoto = Array.isArray(profile.photos) && profile.photos.length > 0
  return hasText && hasAge && hasInterest && hasPhoto
}

const isNewUser = (profile) => {
  if (!profile) return true
  return !profile.name || String(profile.name).trim() === ''
}

const RequireCompleteProfile = ({ children }) => {
  const { profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner fullScreen />
  if (isNewUser(profile) && location.pathname !== ROUTES.EDIT_PROFILE) {
    return <Navigate to={ROUTES.EDIT_PROFILE} replace />
  }
  return children
}

export default RequireCompleteProfile
