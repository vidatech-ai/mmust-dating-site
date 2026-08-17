import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { ROUTES, GENDERS, COURSES, YEARS, APP_NAME } from '@/lib/constants'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  gender: z.enum(['Male', 'Female'], { message: 'Select your gender' }),
  course: z.string().min(1, 'Select your course'),
  year: z.string().min(1, 'Select your year'),
})

const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ name, email, password, gender, course, year }) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name: name.trim(),
        gender,
        course,
        year,
        photos: [],
        interests: [],
        is_banned: false,
      })
      if (profileError) throw profileError

      toast.success('Account created! Complete your profile.')
      navigate(ROUTES.EDIT_PROFILE)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#111111] px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-brand-500/30">
          <Heart size={28} className="text-white" fill="white" />
        </div>
        <h1 className="text-2xl font-black text-white">{APP_NAME}</h1>
        <p className="text-white/40 text-sm">Create your account</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4 max-w-sm w-full mx-auto"
      >
        <Input
          label="Full Name"
          placeholder="Your name"
          icon={User}
          error={errors.name?.message}
          {...register('name')}
        />
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

        {/* Gender */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white/70">Gender</label>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
            {...register('gender')}
          >
            <option value="" className="bg-[#111]">Select gender</option>
            {GENDERS.map(g => (
              <option key={g} value={g} className="bg-[#111]">{g}</option>
            ))}
          </select>
          {errors.gender && <span className="text-xs text-red-400">{errors.gender.message}</span>}
        </div>

        {/* Course */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white/70">Course</label>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
            {...register('course')}
          >
            <option value="" className="bg-[#111]">Select course</option>
            {COURSES.map(c => (
              <option key={c} value={c} className="bg-[#111]">{c}</option>
            ))}
          </select>
          {errors.course && <span className="text-xs text-red-400">{errors.course.message}</span>}
        </div>

        {/* Year */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white/70">Year of Study</label>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
            {...register('year')}
          >
            <option value="" className="bg-[#111]">Select year</option>
            {YEARS.map(y => (
              <option key={y} value={y} className="bg-[#111]">{y}</option>
            ))}
          </select>
          {errors.year && <span className="text-xs text-red-400">{errors.year.message}</span>}
        </div>

        <Button
          size="full"
          loading={loading}
          onClick={handleSubmit(onSubmit)}
          className="mt-2"
        >
          Create Account
        </Button>

        <p className="text-center text-white/40 text-sm">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-brand-400 font-semibold">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Register