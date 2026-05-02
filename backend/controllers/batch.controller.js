import BatchNumber from '../models/BatchNumber.model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse, ApiError } from '../utils/apiResponse.js'

// In-memory Map for O(1) batch lookup
// Loaded once on server start, refreshed every 30 minutes
let batchMap = new Map()
let lastMapLoad = null
const MAP_TTL = 30 * 60 * 1000 // 30 minutes

export const loadBatchMap = async () => {
  console.log('[BATCH MAP] Loading recalled batches into memory...')
  try {
    const recalled = await BatchNumber.find({ 
      status: { $in: ['RECALLED', 'UNDER_INVESTIGATION'] } 
    }).lean()
    
    const newMap = new Map()
    
    recalled.forEach(batch => {
      // Store with multiple key formats for flexible matching
      const keys = [
        batch.batchNumber,                           // Exact: "BNE2401001"
        batch.batchNumber.replace(/[-\/\s]/g, ''),   // No separators: "BNE2401001"
        batch.batchNumber.toLowerCase(),              // Lowercase: "bne2401001"
        batch.batchNumber.replace(/[-\/\s]/g, '').toLowerCase() // Both
      ]
      
      keys.forEach(key => {
        if (key) newMap.set(key, batch)
      })
    })
    
    batchMap = newMap
    lastMapLoad = Date.now()
    console.log(`[BATCH MAP] Loaded ${recalled.length} recalled batches into Map (${batchMap.size} keys)`)
  } catch (error) {
    console.error('[BATCH MAP] Failed to load batch map:', error)
  }
}

// Normalize batch number for consistent lookup
const normalizeBatch = (input) => {
  if (!input) return ''
  return input
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

// O(1) Map lookup with fallback to DB
export const findBatchInMap = (batchNumber) => {
  const normalized = normalizeBatch(batchNumber)
  const noSep = normalized.replace(/[-\/]/g, '')
  
  return (
    batchMap.get(normalized) ||
    batchMap.get(noSep) ||
    batchMap.get(normalized.toLowerCase()) ||
    batchMap.get(noSep.toLowerCase()) ||
    null
  )
}

export const verifyBatch = asyncHandler(async (req, res) => {
  const rawBatch = req.query.batchNumber || req.query.batch // Support both query params

  if (!rawBatch || String(rawBatch).trim().length < 3) {
    throw new ApiError(400, 'Please enter a valid batch number')
  }

  const batchNumber = normalizeBatch(String(rawBatch))
  console.log(`[BATCH] Verifying: ${batchNumber}`)

  // Step 1: O(1) Map lookup for recalled batches
  const mapResult = findBatchInMap(batchNumber)

  if (mapResult) {
    console.log(`[BATCH] Found in Map: ${mapResult.status}`)
    return res.json(new ApiResponse(200, {
      batchNumber: mapResult.batchNumber,
      status: mapResult.status,
      medicine: mapResult.medicine,
      manufacturer: mapResult.manufacturer,
      recallDate: mapResult.recallDate,
      recallReason: mapResult.recallReason,
      recallAuthority: mapResult.recallAuthority,
      severity: mapResult.severity,
      affectedStates: mapResult.affectedStates,
      message: mapResult.status === 'RECALLED'
        ? 'DANGER: This batch has been officially recalled by drug authorities.'
        : 'This batch is currently under investigation.',
      action: mapResult.status === 'RECALLED'
        ? 'Do NOT consume. Return to chemist immediately. Contact CDSCO: 1800-180-3024'
        : 'Avoid using until investigation is complete.',
      helpline: '1800-180-3024',
      source: 'in-memory-map'
    }))
  }

  // Step 2: DB lookup with index for anything not in Map
  const dbResult = await BatchNumber.findOne({ batchNumber }).lean()

  if (dbResult) {
    return res.json(new ApiResponse(200, {
      batchNumber: dbResult.batchNumber,
      status: dbResult.status,
      medicine: dbResult.medicine,
      manufacturer: dbResult.manufacturer,
      message: 'Found in database.',
      helpline: '1800-180-3024'
    }))
  }

  // Step 3: Not found anywhere
  console.log(`[BATCH] Not found: ${batchNumber}`)
  return res.json(new ApiResponse(200, {
    batchNumber,
    status: 'NOT_IN_RECALLED_LIST',
    message: 'This batch is not in our recalled medicines database.',
    safetyNote: 'Not being in our database does NOT mean this medicine is genuine. Our database contains only officially recalled batches reported by CDSCO.',
    helpline: '1800-180-3024',
    cdscoUrl: 'https://cdsco.gov.in'
  }))
})

// Admin route to manually refresh the Map
export const refreshBatchMap = asyncHandler(async (req, res) => {
  await loadBatchMap()
  return res.json(new ApiResponse(200, {
    message: 'Batch map refreshed',
    totalKeys: batchMap.size
  }))
})

export const addBatch = asyncHandler(async (req, res) => {
  const batch = await BatchNumber.create(req.body)
  await loadBatchMap() // Refresh map after adding
  return res.status(201).json(new ApiResponse(201, batch, 'Batch added'))
})

export const updateBatchStatus = asyncHandler(async (req, res) => {
  const batch = await BatchNumber.findByIdAndUpdate(req.params.id, req.body, { new: true })
  await loadBatchMap()
  return res.json(new ApiResponse(200, batch, 'Batch status updated'))
})

export const bulkImportBatches = asyncHandler(async (req, res) => {
  const batches = await BatchNumber.insertMany(req.body)
  await loadBatchMap()
  return res.json(new ApiResponse(200, batches, 'Batches imported'))
})

export const getRecalledBatches = asyncHandler(async (req, res) => {
  const batches = await BatchNumber.find({ status: { $in: ['RECALLED', 'UNDER_INVESTIGATION'] } }).sort({ createdAt: -1 })
  return res.json(new ApiResponse(200, batches, 'Recalled batches fetched'))
})

// Initialize the interval refresh
setInterval(loadBatchMap, MAP_TTL)
