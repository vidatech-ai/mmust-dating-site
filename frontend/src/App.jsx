import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/lib/constants'
import Spinner from '@/components/ui/Spinner'
import PWAInstallBanner from '@/components/PWAInstallBanner'

import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Discover from '@/pages/Discover'
import Profile from '@/pages/Profile'
import EditProfile from '@/pages/EditProfile'
import Chat from '@/pages/Chat'
import ChatRoom from '@/pages/ChatRoom'
import Support from '@/pages/Support'
import NotFound from '@/pages/NotFound'
import Dashboard from '@/pages/admin/Dashboard'
import ForgotPassword from '@/pages/ForgotPassword'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <Spinner fullScreen />
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  return children
}

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <Spinner fullScreen />
  if (user) return <Navigate to={ROUTES.DISCOVER} replace />
  return children
}

const App = () => {
  return (
    <>
      <PWAInstallBanner />
      <Routes>
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DISCOVER} replace />} />
        <Route path={ROUTES.LOGIN} element={<GuestRoute><Login /></GuestRoute>} />
        <Route path={ROUTES.REGISTER} element={<GuestRoute><Register /></GuestRoute>} />
        <Route path={ROUTES.DISCOVER} element={<ProtectedRoute><Discover /></ProtectedRoute>} />
        <Route path={ROUTES.PROFILE} element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path={ROUTES.EDIT_PROFILE} element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path={ROUTES.CHAT} element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path={ROUTES.CHAT_ROOM} element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
        <Route path={ROUTES.SUPPORT} element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path={ROUTES.ADMIN} element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
