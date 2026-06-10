import { Router } from 'express';
import {
  getJournals,
  getJournalById,
  createJournal,
  updateJournal,
  deleteJournal
} from '../controllers/journalController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getJournals)
  .post(createJournal);

router.route('/:id')
  .get(getJournalById)
  .patch(updateJournal)
  .delete(deleteJournal);

export default router;
