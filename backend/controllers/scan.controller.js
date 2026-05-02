import axios from 'axios'
import Scan from '../models/Scan.model.js'
import BatchNumber from '../models/BatchNumber.model.js'
import Chemist from '../models/Chemist.model.js'
import { ApiError, ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { 
  fetchImageAsBase64, 
  performOcrAndQualityCheck, 
  generateFinalSafetyAssessment, 
  askGroq 
} from '../services/groq.service.js'
import { findBatchInMap } from './batch.controller.js'

export const chatAboutMedicine = asyncHandler(async (req, res) => {
  const { message, medicineContext, conversationHistory, scanId } = req.body

  if (!message) throw new ApiError(400, 'Message is required')

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY

  // Build medicine context from scan if scanId provided
  let fullContext = medicineContext || ''
  if (scanId && !fullContext) {
    const scan = await Scan.findById(scanId).lean()
    if (scan) {
      fullContext = `Medicine: ${scan.medicineDetails?.name || 'Unknown'}
Manufacturer: ${scan.medicineDetails?.manufacturer || 'Unknown'}
Category: ${scan.medicineDetails?.category || 'Unknown'}
Batch Status: ${scan.batchStatus}
Risk Level: ${scan.riskLevel}`
    }
  }

  const systemPrompt = `You are MediGuard AI assistant, a helpful medicine information expert for Indian users. 

Context about the medicine being discussed:
${fullContext}

The user is asking about this medicine. Search for accurate, up-to-date information and provide a helpful, detailed response. 

Format your response clearly with:
- Use **bold** for important terms
- Use bullet points for lists
- Include pricing information in Indian Rupees when available
- Mention any important warnings prominently
- Keep medical advice responsible — always suggest consulting a doctor for serious concerns
- Search for current information about this medicine`

  // Build conversation
  const contents = []
  if (conversationHistory?.length > 0) {
    conversationHistory.slice(-6).forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })
    })
  }
  contents.push({
    role: 'user',
    parts: [{ text: `${systemPrompt}\n\nUser question: ${message}` }]
  })

  // Call Gemini with Google Search grounding
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      contents,
      tools: [{ google_search: {} }],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7
      }
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    }
  )

  const text = response?.data?.candidates?.[0]?.content?.parts
    ?.filter(p => p.text)
    ?.map(p => p.text)
    ?.join('\n') || ''

  // Get search queries used if available
  const groundingMetadata = response?.data?.candidates?.[0]?.groundingMetadata
  const searchQueries = groundingMetadata?.webSearchQueries || []
  const sources = groundingMetadata?.groundingChunks
    ?.map(chunk => ({
      title: chunk.web?.title,
      url: chunk.web?.uri
    }))
    ?.filter(s => s.title && s.url)
    ?.slice(0, 3) || []

  if (!text) throw new ApiError(500, 'AI returned empty response')

  return res.json(new ApiResponse(200, {
    reply: text,
    searchQueries,
    sources
  }))
})

export const verifyBatch = asyncHandler(async (req, res) => {
  const rawBatch = req.query.batchNumber || req.query.batch

  if (!rawBatch) throw new ApiError(400, 'Batch number is required')

  const cleanBatch = String(rawBatch).trim().toUpperCase()
  
  // Try map lookup first
  const mapResult = findBatchInMap(cleanBatch)
  if (mapResult) {
    return res.json(new ApiResponse(200, {
      status: mapResult.status,
      batchNumber: mapResult.batchNumber,
      medicine: mapResult.medicine,
      manufacturer: mapResult.manufacturer,
      recallDate: mapResult.recallDate,
      recallReason: mapResult.recallReason,
      recallAuthority: mapResult.recallAuthority,
      severity: mapResult.severity,
      affectedStates: mapResult.affectedStates,
      source: 'in-memory-map'
    }))
  }

  // Fallback to DB
  const batchRecord = await BatchNumber.findOne({
    batchNumber: cleanBatch
  }).lean()

  if (batchRecord) {
    return res.json(new ApiResponse(200, {
      status: batchRecord.status,
      batchNumber: batchRecord.batchNumber,
      medicine: batchRecord.medicine,
      manufacturer: batchRecord.manufacturer,
      recallDate: batchRecord.recallDate,
      recallReason: batchRecord.recallReason,
      recallAuthority: batchRecord.recallAuthority,
      severity: batchRecord.severity,
      affectedStates: batchRecord.affectedStates,
      source: 'database'
    }))
  }

  return res.json(new ApiResponse(200, {
    status: 'NOT_IN_RECALLED_LIST',
    batchNumber: cleanBatch
  }))
})

export const analyzeMedicine = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image uploaded')

  const cloudinaryUrl = req.file.path
  if (!cloudinaryUrl.startsWith('http')) {
    throw new ApiError(500, 'Cloudinary upload failed')
  }

  console.log('[SCAN] Starting pipeline for:', cloudinaryUrl)

  // Step 1: Fetch Image & Run combined OCR + Quality Check
  const { base64Data, mimeType } = await fetchImageAsBase64(cloudinaryUrl)
  const { layer1, layer2, rawResponse: ocrRaw } = await performOcrAndQualityCheck(base64Data, mimeType)

  // Step 2: Batch Number Verification
  const detectedBatch = layer1.batchNumber
  let batchDbResult = null

  if (detectedBatch && detectedBatch !== 'Not visible') {
    console.log('[SCAN] Checking batch in DB:', detectedBatch)
    batchDbResult = findBatchInMap(detectedBatch) || await BatchNumber.findOne({
      batchNumber: detectedBatch.toUpperCase().trim(),
      status: { $in: ['RECALLED', 'UNDER_INVESTIGATION'] }
    }).lean()

    if (!batchDbResult) {
      const normalized = detectedBatch.replace(/[-\/\s]/g, '').toUpperCase()
      batchDbResult = await BatchNumber.findOne({
        batchNumber: { $regex: new RegExp(`^${normalized}`, 'i') },
        status: { $in: ['RECALLED', 'UNDER_INVESTIGATION'] }
      }).lean()
    }
  }

  let batchStatusText = 'Not checked'
  if (batchDbResult) {
    batchStatusText = batchDbResult.status === 'RECALLED' 
      ? `⚠️ RECALLED — ${batchDbResult.recallReason} (${batchDbResult.recallAuthority})`
      : '⚠️ Under Investigation by authorities'
  } else if (detectedBatch) {
    batchStatusText = '✅ Not found in recalled list'
  }

  // Step 3: Run final Safety Assessment
  const layer3 = await generateFinalSafetyAssessment(ocrRaw, batchStatusText)

  // Step 4: Get nearby chemists (2km radius)
  let nearbyChemists = []
  const lat = parseFloat(req.body.lat)
  const lng = parseFloat(req.body.lng)
  const userCity = req.body.city

  if (lat && lng) {
    // 2km is roughly 0.018 degrees
    nearbyChemists = await Chemist.find({
      isVerified: true,
      isBlacklisted: false,
      'coordinates.lat': { $gte: lat - 0.02, $lte: lat + 0.02 },
      'coordinates.lng': { $gte: lng - 0.02, $lte: lng + 0.02 }
    }).limit(5).lean()
  }

  // Fallback to city-based search if no nearby found or no coords
  if (nearbyChemists.length === 0 && userCity) {
    console.log('[SCAN] No chemists found by coordinates, falling back to city:', userCity)
    nearbyChemists = await Chemist.find({
      isVerified: true,
      isBlacklisted: false,
      city: { $regex: new RegExp(userCity, 'i') }
    }).limit(5).lean()
  }

  // Final fallback: just get some verified chemists if still none
  if (nearbyChemists.length === 0) {
    nearbyChemists = await Chemist.find({ isVerified: true, isBlacklisted: false }).limit(3).lean()
  }

  // Step 5: Final Risk Calculation
  let finalRiskLevel = layer3.riskLevel
  let finalStatus = layer3.dbStatus

  if (batchDbResult?.status === 'RECALLED') {
    finalRiskLevel = 'CRITICAL'
    finalStatus = 'FAKE'
  }

  // Step 6: Build final analysis text
  const statusIcon = finalRiskLevel === 'CRITICAL' ? '🚨' : finalRiskLevel === 'HIGH' ? '⛔' : '✅'
  const finalText = `${statusIcon} **${finalRiskLevel} RISK** — ${layer3.verdict.replace(/_/g, ' ')} (${layer3.confidence}% confidence)\n\nMedicine: ${layer1.medicineName || 'Unknown'}\nBatch: ${detectedBatch || 'Not visible'}\nStatus: ${batchStatusText}`

  // Step 7: Save to DB
  const scan = await Scan.create({
    user: req.user?._id || null,
    imageUrl: cloudinaryUrl,
    imagePublicId: req.file.filename,
    result: finalStatus,
    confidence: layer3.confidence,
    reasons: [...layer2.visualConcerns, ...layer2.missingFields],
    recommendations: layer3.nextSteps.split('\n').filter(l => l.trim()),
    medicineDetails: {
      name: layer1.medicineName || 'Not detected',
      genericName: layer1.genericName || 'Not detected',
      manufacturer: layer1.manufacturer || 'Not detected',
      category: layer1.requiresPrescription ? 'Prescription' : 'OTC',
      estimatedMRP: layer1.mrp || 'Not visible',
      batchNumber: detectedBatch || 'Not visible'
    },
    analysisText: finalText,
    batchStatus: batchDbResult?.status || (detectedBatch ? 'NOT_IN_RECALLED_LIST' : 'NOT_DETECTED'),
    batchDetails: batchDbResult,
    nearbyChemists,
    riskLevel: finalRiskLevel,
    analysisLayers: { layer1, layer2, layer3 },
    location: {
      city: req.body.city || '',
      state: req.body.state || '',
      coordinates: { lat: lat || 0, lng: lng || 0 }
    }
  })

  return res.status(200).json(new ApiResponse(200, {
    scanId: scan._id,
    pipeline: {
      step1_packaging: {
        status: finalStatus,
        confidence: layer3.confidence,
        fields: layer1,
        redFlags: layer2.visualConcerns,
        text: finalText,
        layer1, layer2, layer3
      },
      step2_batch: batchDbResult || { status: detectedBatch ? 'NOT_IN_RECALLED_LIST' : 'NOT_DETECTED', batchNumber: detectedBatch },
      step3_medicineDb: { found: false },
      step4_chemists: nearbyChemists,
      finalRiskLevel,
      finalStatus
    }
  }, 'Analysis complete'))
})

export const getScanHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20

  const scans = await Scan.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('imageUrl result confidence riskLevel medicineDetails batchStatus createdAt')
    .lean()

  const total = await Scan.countDocuments({ user: req.user._id })

  return res.json(new ApiResponse(200, {
    scans,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }))
})

export const getScanById = asyncHandler(async (req, res) => {
  const scan = await Scan.findOne({ 
    _id: req.params.id, 
    user: req.user._id 
  }).lean()

  if (!scan) throw new ApiError(404, 'Scan not found')
  return res.json(new ApiResponse(200, scan))
})

export const deleteScan = asyncHandler(async (req, res, next) => {
  const scan = await Scan.findOneAndDelete({ _id: req.params.id, user: req.user._id })
  
  if (!scan) {
    return next(new ApiError(404, 'Scan not found'))
  }

  res.status(200).json(new ApiResponse(200, null, 'Scan deleted successfully'))
})

export const getPublicStats = asyncHandler(async (req, res, next) => {
  const total = await Scan.countDocuments()
  const genuine = await Scan.countDocuments({ result: { $in: ['LOOKS_PROFESSIONAL', 'GENUINE'] } })
  const fake = await Scan.countDocuments({ result: { $in: ['HAS_ISSUES', 'UNCLEAR', 'FAKE', 'SUSPICIOUS'] } })
  
  res.status(200).json(new ApiResponse(200, { total, genuine, fake }, 'Public stats fetched'))
})
