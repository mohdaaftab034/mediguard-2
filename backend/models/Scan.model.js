import mongoose from 'mongoose'

const scanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: { type: String, required: true },
  imagePublicId: { type: String },
  result: {
    type: String,
    enum: ['LOOKS_PROFESSIONAL', 'HAS_ISSUES', 'UNCLEAR', 'GENUINE', 'FAKE', 'SUSPICIOUS'],
    required: true
  },
  confidence: { type: Number, min: 0, max: 100 },
  reasons: [{ type: String }],
  recommendations: [{ type: String }],
  medicineDetails: {
    name: String,
    manufacturer: String,
    category: String,
    estimatedMRP: String,
    batchNumber: String
  },
  batchNumber: { type: String },
  batchStatus: { 
    type: String, 
    enum: ['NOT_CHECKED', 'NOT_DETECTED', 'RECALLED', 'UNDER_INVESTIGATION', 'NOT_IN_RECALLED_LIST', 'UNVERIFIED'],
    default: 'NOT_CHECKED'
  },
  batchDetails: { type: mongoose.Schema.Types.Mixed },
  medicineDbResult: { type: mongoose.Schema.Types.Mixed },
  nearbyChemists: [{ type: mongoose.Schema.Types.Mixed }],
  analysisLayers: { type: mongoose.Schema.Types.Mixed },
  riskLevel: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  location: {
    city: String,
    state: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  analysisText: String,
  chatHistory: [
    {
      role: { type: String, enum: ['user', 'ai'] },
      content: { type: String },
      type: { type: String }, // e.g., 'text', 'full_report'
      timestamp: { type: Date, default: Date.now }
    }
  ],
  isReported: { type: Boolean, default: false },
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' }
}, { timestamps: true })

// Optimization Indexes
scanSchema.index({ user: 1, createdAt: -1 })  // User history query
scanSchema.index({ result: 1 })
scanSchema.index({ 'medicineDetails.name': 1 })
scanSchema.index({ createdAt: -1 })

export default mongoose.model('Scan', scanSchema)
