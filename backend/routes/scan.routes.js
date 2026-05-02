import express from 'express'
import { analyzeMedicine, getScanHistory, getScanById, deleteScan, getPublicStats, chatAboutMedicine, verifyBatch } from '../controllers/scan.controller.js'
import { verifyToken, optionalVerifyToken } from '../middleware/auth.middleware.js'
import { medicineImageUpload } from '../middleware/upload.middleware.js'
import { scanLimiter } from '../middleware/rateLimit.middleware.js'

const router = express.Router()

router.get('/stats/public', getPublicStats)

router.post('/analyze', optionalVerifyToken, scanLimiter, medicineImageUpload.single('medicineImage'), analyzeMedicine)
router.post('/chat', optionalVerifyToken, chatAboutMedicine)
router.get('/verify-batch', verifyBatch)

router.use(verifyToken)

router.get('/history', getScanHistory)
router.get('/history/:id', getScanById)
router.delete('/:id', deleteScan)

export default router
