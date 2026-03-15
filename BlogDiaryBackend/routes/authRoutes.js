import express from 'express';
import { 
  register, 
  verifyEmail, 
  login, 
  getMe, 
  updateProfile, 
  uploadUserProfileImage,
  forgotPassword,
  resetPassword,
  changePassword,
  resendVerificationEmail,
  updateNotificationPreferences,
  registerSuperAdmin,
  getUserFullDetails
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { registerSchema, loginSchema } from '../validations/schemas.js';
import { uploadProfileImage } from '../middleware/upload.js';


const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/superadmin/register', registerSuperAdmin);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadProfileImage,updateProfile);
router.post('/upload-profile-image', protect, uploadProfileImage,uploadUserProfileImage);
router.patch("/manage/notifications", protect, updateNotificationPreferences);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);
router.get("/users/:id/details", protect, getUserFullDetails);

export default router;
