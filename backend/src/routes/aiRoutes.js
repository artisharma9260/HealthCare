import { Router } from 'express';
import { generatePreVisitSummary, generatePostVisitSummary } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(protect);
router.post('/pre-visit-summary', asyncHandler(generatePreVisitSummary));
router.post('/post-visit-summary', asyncHandler(generatePostVisitSummary));

export default router;
