import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import UserModel from './models/user.model.js';

dotenv.config();

async function createAdminUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await UserModel.findOne({ email: 'admin@blinkit.com' });

        if (existingAdmin) {
            console.log('❌ Admin user already exists!');
            console.log('Email: admin@blinkit.com');
            console.log('Use the existing password or delete this user first.');
            process.exit(0);
        }

        // Create admin user
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash('admin123', salt);

        const adminUser = new UserModel({
            name: 'Admin',
            email: 'admin@blinkit.com',
            password: hashedPassword,
            role: 'ADMIN',
            verify_email: true,
            status: 'Active'
        });

        await adminUser.save();

        console.log('\n✅ Admin user created successfully!');
        console.log('\n📧 Login Credentials:');
        console.log('Email: admin@blinkit.com');
        console.log('Password: admin123');
        console.log('\n⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
