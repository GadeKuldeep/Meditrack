import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected!');

    const name = 'Test Patient';
    const email = 'testpatient@example.com';
    const password = 'password123';
    const role = 'Patient';

    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      console.log(`User with email ${email} already exists. Deleting existing user to recreate...`);
      await User.deleteOne({ email });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
    });

    console.log('\n✅ Success! Test user added to the database directly.');
    console.log('----------------------------------------------------');
    console.log(`Name:     ${user.name}`);
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role:     ${user.role}`);
    console.log('----------------------------------------------------\n');
    console.log('You can now use these credentials to log in on the frontend.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }
};

createTestUser();
