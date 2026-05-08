import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Medication from './models/Medication.js';
import DoseLog from './models/DoseLog.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Medication.deleteMany();
    await DoseLog.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('123456', salt);

    const createdUsers = await User.insertMany([
      {
        name: 'John Doe (Patient)',
        email: 'john@example.com',
        passwordHash,
        role: 'Patient',
        isVerified: true,
      },
      {
        name: 'Jane Smith (Caregiver)',
        email: 'jane@example.com',
        passwordHash,
        role: 'Caregiver',
        isVerified: true,
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash,
        role: 'Admin',
        isVerified: true,
      },
    ]);

    const patientId = createdUsers[0]._id;

    const meds = await Medication.insertMany([
      {
        userId: patientId,
        name: 'Amoxicillin',
        dosage: 500,
        unit: 'mg',
        frequency: 'Daily',
        schedule: [{ time: '08:00' }, { time: '20:00' }],
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        category: 'Antibiotic',
        notes: 'Take with food',
      },
      {
        userId: patientId,
        name: 'Lisinopril',
        dosage: 10,
        unit: 'mg',
        frequency: 'Daily',
        schedule: [{ time: '09:00' }],
        startDate: new Date(),
        category: 'Blood Pressure',
      },
    ]);

    console.log('Data Imported successfully');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

seedData();
