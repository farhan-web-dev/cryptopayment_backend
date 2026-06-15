import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/crypto_payment',
  jwtSecret: process.env.JWT_SECRET || 'supersecret',
  nodeEnv: process.env.NODE_ENV || 'development',
};
