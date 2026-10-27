import publicRouter from './public.js';
import adminRouter from './admin.js';
import authRouter from './auth.js';
import uploadRouter from './upload.js';

export const routes = {
  public: publicRouter,
  admin: adminRouter,
  auth: authRouter,
  upload: uploadRouter,
};