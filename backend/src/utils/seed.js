import 'dotenv/config';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import mongoose from 'mongoose';

const DEMO_PASSWORD = 'password123';

async function upsertUser({ email, username, role }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, username, role, password: DEMO_PASSWORD });
    console.log(`Created user: ${email} (${role})`);
  } else {
    console.log(`User already exists: ${email}`);
  }
  return user;
}

async function seed() {
  await connectDB();

  const patient = await upsertUser({ email: 'patient@demo.com', username: 'Demo Patient', role: 'patient' });
  const doctorUser = await upsertUser({ email: 'doctor@demo.com', username: 'Dr. Demo', role: 'doctor' });
  await upsertUser({ email: 'admin@demo.com', username: 'Demo Admin', role: 'admin' });

  const existingDoctorProfile = await Doctor.findOne({ email: 'doctor@demo.com' });
  if (!existingDoctorProfile) {
    await Doctor.create({
      userId: doctorUser._id,
      name: 'Dr. Demo',
      email: 'doctor@demo.com',
      specialisation: 'General Medicine',
      bio: 'Demo doctor profile for local development and testing.',
      slotDurationMinutes: 30,
      leaveDays: [],
      workingHours: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00' },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
        { day: 'Friday', startTime: '09:00', endTime: '15:00' },
      ],
    });
    console.log('Created doctor profile for doctor@demo.com');
  } else {
    console.log('Doctor profile already exists for doctor@demo.com');
  }

  console.log('\nSeed complete. Demo credentials (all use password: ' + DEMO_PASSWORD + '):');
  console.log('  patient@demo.com (patient)');
  console.log('  doctor@demo.com  (doctor)');
  console.log('  admin@demo.com   (admin)');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
