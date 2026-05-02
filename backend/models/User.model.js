import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['public', 'chemist', 'admin'], default: 'public' },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  avatar: { type: String },
  savedMedicines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }],
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  lastLogin: { type: Date },
  refreshToken: { type: String }
}, { 
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.password
      delete ret.refreshToken
      return ret
    }
  }
})

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  } catch (error) {
    throw error
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model('User', userSchema)
