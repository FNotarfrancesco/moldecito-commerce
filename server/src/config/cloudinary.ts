import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('☁️ Cloudinary configured');
} else {
  console.warn('⚠️ Cloudinary credentials not set - upload will not work');
}

export { cloudinary };

export async function uploadImage(
  file: string,
  options: { folder?: string; publicId?: string; transformation?: Record<string, unknown> } = {}
): Promise<{ secureUrl: string; publicId: string }> {
  const { folder = 'moldecito/products', publicId, transformation } = options;

  const result = await cloudinary.uploader.upload(file, {
    folder,
    public_id: publicId,
    transformation: [
      { width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
      ...(transformation ? [transformation] : []),
    ],
    overwrite: true,
  });

  return { secureUrl: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getOptimizedUrl(publicId: string, options: { width?: number; height?: number; crop?: string; quality?: string } = {}): string {
  const { width = 800, height = 800, crop = 'fill', quality = 'auto' } = options;
  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    fetch_format: 'auto',
    secure: true,
  });
}