import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import UserModel from './models/user.model.js';

dotenv.config();

async function createRegularUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email: 'user@zipmart.com' });

        if (existingUser) {
            console.log('⚠️  User already exists!');
            console.log('\n📧 Email: user@zipmart.com');
            console.log('🔑 Password: user123');
            process.exit(0);
        }

        // Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash('user123', salt);

        // Create user
        const newUser = new UserModel({
            name: 'Test User',
            email: 'user@zipmart.com',
            password: hashPassword,
            mobile: '9876543210',
            verify_email: true,
            status: 'Active',
            role: 'USER'
        });

        await newUser.save();

        console.log('✅ Regular user created successfully!\n');
        console.log('📧 Email: user@zipmart.com');
        console.log('🔑 Password: user123');
        console.log('👤 Role: USER\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createRegularUser();
