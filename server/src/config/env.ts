import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback: string | undefined): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: required('NODE_ENV', 'development'),
  port: Number(required('PORT', '5000')),
  clientUrl: required('CLIENT_URL', 'http://localhost:5173'),
  mongoUri: required('MONGODB_URI', '').trim(),
  jwtSecret: required('JWT_SECRET', 'dev-only-change-me'),
  jwtExpiresIn: required('JWT_EXPIRES_IN', '7d'),
};