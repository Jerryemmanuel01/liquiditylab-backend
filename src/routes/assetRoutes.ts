import { Router } from 'express';
import { 
  createAsset, 
  getAssets, 
  updateAsset, 
  deleteAsset 
} from '../controllers/assetController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .post(createAsset)
  .get(getAssets);

router.route('/:id')
  .patch(updateAsset)
  .delete(deleteAsset);

export default router;
