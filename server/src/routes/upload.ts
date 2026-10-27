import { Router } from 'express';
import { cloudinary } from '../config/cloudinary.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/upload/signature - Devuelve firma para upload directo desde frontend (unsigned preset)
router.post('/signature', requireAuth, (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'moldecito/products';
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET ?? 'moldecito_unsigned';

  // Para unsigned upload, solo necesitamos el preset y timestamp
  res.json({
    timestamp,
    uploadPreset,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
});

// DELETE /api/upload/:publicId - Borrar imagen (solo admin)
router.delete('/:publicId', requireAuth, async (req, res) => {
  try {
    const result = await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
});

export default router;