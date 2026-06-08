import { Router } from 'express';
import { signup, login, forgotPassword, resetPassword } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { SignupValidation, LoginValidation } from '../validations/authValidation';

const router = Router();

router.post('/signup', validate(SignupValidation), signup);
router.post('/login', validate(LoginValidation), login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

export default router;
