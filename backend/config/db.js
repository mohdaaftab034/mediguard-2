import mongoose from 'mongoose'

import { MongoMemoryServer } from 'mongodb-memory-server'

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI
    
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    console.log('Connecting to MongoDB...')
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
    return uri
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`)
    
    // Only try fallback in development
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Attempting to start local in-memory MongoDB fallback...')
      try {
        const mongod = await MongoMemoryServer.create({
          binary: {
            version: '6.0.1', // Specify a version to potentially help with resolution
          }
        })
        const uri = mongod.getUri()
        const conn = await mongoose.connect(uri)
        console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`)
        return uri
      } catch (memError) {
        console.error(`Critical: Memory Server fallback failed: ${memError.message}`)
        console.error('Please ensure you have a local MongoDB instance running or a valid MONGODB_URI in your .env file.')
        process.exit(1)
      }
    } else {
      console.error('Production environment: Database connection is required.')
      process.exit(1)
    }
  }
}
