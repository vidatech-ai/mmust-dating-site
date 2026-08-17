import { Router } from 'express'
import { getStats, getAllUsers, banUser, unbanUser } from '../controllers/adminController.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.use(requireAdmin)

router.get('/stats', getStats)
router.get('/users', getAllUsers)
router.patch('/users/:userId/ban', banUser)
router.patch('/users/:userId/unban', unbanUser)

export default router