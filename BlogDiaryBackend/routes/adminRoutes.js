import express from 'express';
import { adminOnly, protect } from '../middleware/auth.js';
import { deleteUser, getAdminDashboard, getAllUsers } from '../controllers/adminController.js';



const router = express.Router({ mergeParams: true });

router.get("/dashboard", protect, adminOnly, getAdminDashboard);

router.get("/users", protect, adminOnly, getAllUsers);

router.delete("/users/:id", protect, adminOnly, deleteUser);



export default router;
