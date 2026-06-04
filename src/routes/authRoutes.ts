import { Router } from 'express';
import { signup, login } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { SignupValidation, LoginValidation } from '../validations/authValidation';

const router = Router();

router.post('/signup', validate(SignupValidation), signup);
router.post('/login', validate(LoginValidation), login);

export default router;
