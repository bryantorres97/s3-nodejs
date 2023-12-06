import dotenv from 'dotenv';

dotenv.config();

export const PORT = parseInt(process.env.PORT || '3000', 10);
export const S3_BUCKET = process.env.S3_BUCKET || '';
export const S3_BUCKET_REGION = process.env.S3_BUCKET_REGION || '';
export const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || '';
export const S3_SECRET_KEY = process.env.S3_SECRET_KEY || '';
