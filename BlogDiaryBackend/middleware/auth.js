import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { sendError } from '../utils/response.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return sendError(res, 401, 'No token provided');
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return sendError(res, 401, 'Invalid token');
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    sendError(res, 401, 'Authentication failed');
  }
};




export const adminOnly = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (user.role !== "admin" && user.role !== "superadmin") {
      return sendError(res, 403, "Access denied. Admin only.");
    }

    next();
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Authorization failed");
  }
};