import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT) ?? 3001,

  MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/moldecito',

  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  JWT_COOKIE_NAME: 'moldecito_auth',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? '',
  CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET ?? 'moldecito_unsigned',

  WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER ?? '5491100000000',

  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:8443',
} as const;

export const isProd = env.NODE_ENV === 'production';