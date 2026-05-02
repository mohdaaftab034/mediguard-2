import mongoose from 'mongoose'

const batchSchema = new mongoose.Schema({
  batchNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true,
    index: true  // Primary index
  },
  medicine: { type: String, required: true, index: true },
  manufacturer: { type: String, required: true },
  expiryDate: { type: String },
  status: { 
    type: String, 
    enum: ['RECALLED', 'UNDER_INVESTIGATION', 'NOT_LISTED'],
    default: 'NOT_LISTED',
    index: true  // Index for status filter
  },
  recallDate: { type: String },
  recallReason: { type: String },
  recallAuthority: { type: String },
  severity: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    index: true
  },
  affectedStates: [{ type: String, index: true }],
  sourceUrl: { type: String }
}, { timestamps: true })

// Compound index for most common query
batchSchema.index({ batchNumber: 1, status: 1 })

// Text index for medicine name search
batchSchema.index({ medicine: 'text', manufacturer: 'text' })

export default mongoose.model('BatchNumber', batchSchema)
