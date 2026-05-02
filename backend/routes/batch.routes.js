import express from 'express'
import { verifyBatch, addBatch, updateBatchStatus, bulkImportBatches, getRecalledBatches, refreshBatchMap } from '../controllers/batch.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/role.middleware.js'

const router = express.Router()

router.get('/verify', verifyBatch)
router.get('/recalled', getRecalledBatches)

router.use(verifyToken)
router.use(isAdmin)

router.post('/refresh-map', refreshBatchMap)
router.post('/', addBatch)
router.put('/:id/status', updateBatchStatus)
router.post('/bulk-import', bulkImportBatches)

export default router
