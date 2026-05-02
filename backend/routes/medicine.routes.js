import express from 'express'
import { searchMedicine, getMedicineSuggestions, askMedicineAI, getPopularMedicines } from '../controllers/medicine.controller.js'

const router = express.Router()

router.get('/search', searchMedicine)
router.get('/suggestions', getMedicineSuggestions)
router.get('/popular', getPopularMedicines)
router.post('/ask-ai', askMedicineAI)

export default router
