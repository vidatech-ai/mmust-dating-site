import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Lock, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { APP_NAME, APP_TAGLINE, ROUTES } from '@/lib/constants'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    navigate(ROUTES.DISCOVER)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#111111]">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 w-full">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center mb-10"
          >
            <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-500/30">
              <Heart size={32} className="text-white" fill="white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">{APP_NAME}</h1>
            <p className="text-white/40 text-sm mt-1">{APP_TAGLINE}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full flex flex-col gap-4"
          >
            <Input
              label="Email"
              type="email"
              placeholder="you@mmust.ac.ke"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              size="full"
              loading={loading}
              onClick={handleSubmit(onSubmit)}
              className="mt-2"
            >
              Sign In
            </Button>

            <p className="text-center text-white/40 text-sm">
              Don't have an account?{' '}
              <Link to={ROUTES.REGISTER} className="text-brand-400 font-semibold">
                Sign Up
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      <p className="text-center text-white/20 text-xs pb-8">
        MMUST students only · Be respectful
      </p>
    </div>
  )
}

export default Login
