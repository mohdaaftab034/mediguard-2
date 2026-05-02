import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Chemist from './models/Chemist.model.js'
import './models/User.model.js' // Register User schema

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

const demoChemists = [
  {
    shopName: "Apollo Pharmacy - Local",
    licenseNumber: "LIC-AP-101",
    address: "Sector 18, Block B",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "201301",
    phone: "0120-4567890",
    coordinates: {
      lat: 28.5708,
      lng: 77.3261
    },
    isVerified: true,
    rating: 4.8
  },
  {
    shopName: "Wellness Forever",
    licenseNumber: "LIC-WF-202",
    address: "Link Road, Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400053",
    phone: "022-26345678",
    coordinates: {
      lat: 19.1136, 
      lng: 72.8697
    },
    isVerified: true,
    rating: 4.7
  },
  {
    shopName: "Guardian Pharmacy",
    licenseNumber: "LIC-GP-303",
    address: "Connaught Place, Inner Circle",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
    phone: "011-23415678",
    coordinates: {
      lat: 28.6315,
      lng: 77.2167
    },
    isVerified: true,
    rating: 4.9
  },
  {
    shopName: "Netmeds Store",
    licenseNumber: "LIC-NM-404",
    address: "T-Nagar, Burkit Road",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600017",
    phone: "044-24345678",
    coordinates: {
      lat: 13.0418,
      lng: 80.2341
    },
    isVerified: true,
    rating: 4.6
  }
]

const seedChemists = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const User = mongoose.model('User')
    const admin = await User.findOne({ role: 'admin' }) || await User.findOne()
    
    if (!admin) {
      console.error('No user found to associate chemists with')
      process.exit(1)
    }

    const chemistsWithUser = demoChemists.map(c => ({ ...c, user: admin._id }))

    for (const chemist of chemistsWithUser) {
      await Chemist.findOneAndUpdate(
        { licenseNumber: chemist.licenseNumber },
        chemist,
        { upsert: true, new: true }
      )
    }

    console.log('Seeded chemists with coordinates successfully')
    process.exit()
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

seedChemists()
