import { useAuth } from '@/context/AuthContext'
import { CHAT_UNLOCK_AMOUNT } from '@/lib/constants'

export const usePaystack = () => {
  const { user, profile } = useAuth()

  const initializePayment = ({ amount, onSuccess, onClose, metadata = {} }) => {
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: amount * 100, // kobo
      currency: 'KES',
      metadata: {
        user_id: user.id,
        name: profile?.name,
        ...metadata,
      },
      callback: (response) => {
        onSuccess(response.reference)
      },
      onClose: () => {
        if (onClose) onClose()
      },
    })
    handler.openIframe()
  }

  const payChatUnlock = ({ targetUserId, onSuccess, onClose }) => {
    initializePayment({
      amount: CHAT_UNLOCK_AMOUNT,
      metadata: { type: 'chat_unlock', target_user_id: targetUserId },
      onSuccess,
      onClose,
    })
  }

  const paySupport = ({ amount, onSuccess, onClose }) => {
    initializePayment({
      amount,
      metadata: { type: 'support' },
      onSuccess,
      onClose,
    })
  }

  return { payChatUnlock, paySupport }
}