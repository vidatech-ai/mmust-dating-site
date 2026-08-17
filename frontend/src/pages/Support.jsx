import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Coffee, Star, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePaystack } from '@/hooks/usePaystack'
import { SUPPORT_AMOUNTS, APP_NAME } from '@/lib/constants'
import PageWrapper from '@/components/layout/PageWrapper'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'

const icons = [Coffee, Heart, Star, Zap]

const labels = [
  'Buy me a coffee',
  'Show some love',
  'You\'re a star!',
  'Power me up!',
]

const Support = () => {
  const { paySupport } = usePaystack()
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSupport = () => {
    if (!selected) return toast.error('Select an amount first')
    setLoading(true)
    paySupport({
      amount: selected,
      onSuccess: (ref) => {
        toast.success('Thank you so much! 💕')
        setLoading(false)
        setSelected(null)
      },
      onClose: () => {
        toast('Payment cancelled')
        setLoading(false)
      },
    })
  }

  return (
    <PageWrapper>
      <TopBar title="Support" showBack />

      <div className="px-4 py-8 flex flex-col gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-brand-500/20 flex items-center justify-center">
            <Heart size={40} className="text-brand-400" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Support {APP_NAME}</h2>
            <p className="text-white/40 text-sm mt-2 leading-relaxed">
              This app is built and maintained by one person.<br />
              Your support keeps it alive and growing!
            </p>
          </div>
        </motion.div>

        {/* Amount grid */}
        <div className="grid grid-cols-2 gap-3">
          {SUPPORT_AMOUNTS.map((amount, i) => {
            const Icon = icons[i]
            return (
              <motion.button
                key={amount}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(amount)}
                className={`
                  flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all
                  ${selected === amount
                    ? 'bg-brand-500/20 border-brand-500'
                    : 'bg-white/5 border-white/10'}
                `}
              >
                <Icon
                  size={28}
                  className={selected === amount ? 'text-brand-400' : 'text-white/40'}
                />
                <span className="text-white font-black text-xl">KES {amount}</span>
                <span className="text-white/40 text-xs">{labels[i]}</span>
              </motion.button>
            )
          })}
        </div>

        <Button
          size="full"
          loading={loading}
          disabled={!selected}
          onClick={handleSupport}
        >
          <Heart size={16} fill="white" />
          Support with KES {selected || '...'}
        </Button>

        <p className="text-center text-white/20 text-xs">
          Payments secured by Paystack
        </p>
      </div>
    </PageWrapper>
  )
}

export default Support