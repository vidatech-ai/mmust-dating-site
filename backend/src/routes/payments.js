import { Router } from 'express'
import { verifyChatUnlock, verifySupportPayment } from '../controllers/paymentsController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/verify-chat-unlock', requireAuth, verifyChatUnlock)
router.post('/verify-support', requireAuth, verifySupportPayment)

export default router