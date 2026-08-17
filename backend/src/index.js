import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import paymentsRouter from './routes/payments.js'
import adminRouter from './routes/admin.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// ── Security middleware ──────────────────────
app.use(helmet())

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, slow down.' },
})
app.use(limiter)

// Stricter limit on payment routes
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many payment requests.' },
})

app.use(express.json({ limit: '10kb' })) // prevent large payload attacks

// ── Health check ─────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', app: 'MMUST Dating API' })
})

// ── Routes ───────────────────────────────────
app.use('/api/payments', paymentLimiter, paymentsRouter)
app.use('/api/admin', adminRouter)

// ── 404 handler ──────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── Global error handler ─────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`MMUST Dating API running on port ${PORT}`)
})