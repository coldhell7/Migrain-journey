import path from 'path';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  dbPath: process.env.DB_PATH || path.join(__dirname, '../../data.db'),
  defaultAdmin: {
    email: process.env.ADMIN_EMAIL || 'admin@migrain2.app',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    displayName: 'Admin',
  },
  defaultDoctor: {
    email: process.env.DOCTOR_EMAIL || 'doctor@migrain2.app',
    password: process.env.DOCTOR_PASSWORD || 'doctor123',
    displayName: 'Dr. Smith',
  },
  clientDist: path.join(__dirname, '../../client/dist'),
};
