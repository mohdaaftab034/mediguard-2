import Chemist from '../models/Chemist.model.js'
import User from '../models/User.model.js'
import { ApiError, ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendChemistApproval, sendChemistRejection } from '../services/email.service.js'

export const registerChemist = asyncHandler(async (req, res, next) => {
  const existing = await Chemist.findOne({ user: req.user._id })
  if (existing) return next(new ApiError(400, 'Chemist profile already exists'))

  const chemistData = {
    ...req.body,
    user: req.user._id,
    documents: {
      licenseImage: req.files?.licenseImage ? req.files.licenseImage[0].path : null,
      shopImage: req.files?.shopImage ? req.files.shopImage[0].path : null
    }
  }

  const chemist = await Chemist.create(chemistData)
  res.status(201).json(new ApiResponse(201, chemist, 'Chemist registration submitted'))
})

export const getMyChemistProfile = asyncHandler(async (req, res, next) => {
  const chemist = await Chemist.findOne({ user: req.user._id })
  if (!chemist) return next(new ApiError(404, 'Chemist profile not found'))
  res.status(200).json(new ApiResponse(200, chemist, 'Profile fetched'))
})

export const updateChemistProfile = asyncHandler(async (req, res, next) => {
  const chemist = await Chemist.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  )
  if (!chemist) return next(new ApiError(404, 'Chemist profile not found'))
  res.status(200).json(new ApiResponse(200, chemist, 'Profile updated'))
})

export const getNearbyChemists = asyncHandler(async (req, res, next) => {
  const { lat, lng, city } = req.query
  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)

  let chemists = []

  if (latitude && longitude) {
    // 2km radius roughly 0.018 degrees
    chemists = await Chemist.find({
      isVerified: true,
      isBlacklisted: false,
      'coordinates.lat': { $gte: latitude - 0.02, $lte: latitude + 0.02 },
      'coordinates.lng': { $gte: longitude - 0.02, $lte: longitude + 0.02 }
    }).limit(10).lean()
  }

  // Fallback to city search
  if (chemists.length === 0 && city) {
    chemists = await Chemist.find({
      isVerified: true,
      isBlacklisted: false,
      city: { $regex: new RegExp(city, 'i') }
    }).limit(10).lean()
  }

  // Final fallback
  if (chemists.length === 0) {
    chemists = await Chemist.find({ isVerified: true, isBlacklisted: false }).limit(5).lean()
  }

  res.status(200).json(new ApiResponse(200, chemists, 'Nearby chemists fetched'))
})

export const getVerificationQueue = asyncHandler(async (req, res, next) => {
  const chemists = await Chemist.find({ isVerified: false, isBlacklisted: false }).populate('user', 'name email phone')
  res.status(200).json(new ApiResponse(200, chemists, 'Verification queue fetched'))
})

export const approveChemist = asyncHandler(async (req, res, next) => {
  const chemist = await Chemist.findByIdAndUpdate(
    req.params.id,
    { isVerified: true, verifiedAt: new Date(), verifiedBy: req.user._id },
    { new: true }
  )
  if (!chemist) return next(new ApiError(404, 'Chemist not found'))
  
  sendChemistApproval(chemist)
  res.status(200).json(new ApiResponse(200, chemist, 'Chemist approved'))
})

export const rejectChemist = asyncHandler(async (req, res, next) => {
  const chemist = await Chemist.findById(req.params.id)
  if (!chemist) return next(new ApiError(404, 'Chemist not found'))
  
  sendChemistRejection(chemist, req.body.reason || 'Not provided')
  await chemist.deleteOne() // or keep it as rejected
  res.status(200).json(new ApiResponse(200, null, 'Chemist rejected and removed'))
})

export const blacklistChemist = asyncHandler(async (req, res, next) => {
  const chemist = await Chemist.findByIdAndUpdate(
    req.params.id,
    { isBlacklisted: true, blacklistReason: req.body.reason },
    { new: true }
  )
  if (!chemist) return next(new ApiError(404, 'Chemist not found'))
  
  res.status(200).json(new ApiResponse(200, chemist, 'Chemist blacklisted'))
})

export const getChemistStats = asyncHandler(async (req, res, next) => {
  const total = await Chemist.countDocuments()
  const verified = await Chemist.countDocuments({ isVerified: true })
  const pending = await Chemist.countDocuments({ isVerified: false, isBlacklisted: false })
  const blacklisted = await Chemist.countDocuments({ isBlacklisted: true })
  
  res.status(200).json(new ApiResponse(200, { total, verified, pending, blacklisted }, 'Stats fetched'))
})
