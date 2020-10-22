import { Router } from 'express';

import authRoutes from './auth';
import accountRoutes from './account';

const router = Router();

router.use('/auth', authRoutes);
router.use('/account', accountRoutes);

export default router;
