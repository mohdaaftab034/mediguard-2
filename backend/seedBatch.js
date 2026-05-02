import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BatchNumber from './models/BatchNumber.model.js';

dotenv.config();

const seedData = [
  {
    batchNumber: 'BN2024KL001',
    medicine: 'Warfarin Sodium 2mg',
    manufacturer: 'Nicholas Piramal India Ltd',
    status: 'RECALLED',
    recallDate: '2024-03-15',
    recallReason: 'Assay failure — Cardiac patients at risk',
    recallAuthority: 'Kerala Drug Authority',
    severity: 'CRITICAL',
    affectedStates: ['Kerala', 'Tamil Nadu', 'Karnataka']
  },
  {
    batchNumber: 'BNE2401001',
    medicine: 'Paracetamol IP 500mg',
    manufacturer: 'Ridley Life Sciences Pvt. Ltd.',
    status: 'RECALLED',
    recallReason: 'Dissolution test failed',
    recallAuthority: 'CDSCO East Zone',
    severity: 'HIGH',
    affectedStates: ['West Bengal', 'Bihar', 'Odisha']
  },
  {
    batchNumber: 'SPR2024001',
    medicine: 'Augmentin 625mg',
    manufacturer: 'GSK (Counterfeit)',
    status: 'RECALLED',
    recallReason: 'Spurious product — No active ingredients found',
    recallAuthority: 'CDSCO HQ New Delhi',
    severity: 'CRITICAL',
    affectedStates: ['Delhi', 'UP', 'Punjab']
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const data of seedData) {
      await BatchNumber.findOneAndUpdate(
        { batchNumber: data.batchNumber },
        { $set: data },
        { upsert: true }
      );
    }

    console.log('Batch data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
