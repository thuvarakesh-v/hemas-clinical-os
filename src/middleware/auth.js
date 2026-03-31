const { verifyAccessToken } = require('../services/authService');
const { User, Doctor, Staff, Admin } = require('../models');

function authMiddleware(roles = []) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);

      let entity = null;

      if (decoded.role === 'patient') {
        if (roles.length && !roles.includes('patient')) {
          return res.status(403).json({ success: false, message: 'Access denied' });
        }
        entity = await User.findByPk(decoded.id);
      } else if (decoded.role === 'doctor') {
        if (roles.length && !roles.includes('doctor')) {
          return res.status(403).json({ success: false, message: 'Access denied' });
        }
        entity = await Doctor.findByPk(decoded.id);
      } else if (['medical_staff', 'medicine_staff', 'nurse', 'receptionist', 'lab_technician'].includes(decoded.role)) {
        if (roles.length && !roles.includes('staff') && !roles.includes(decoded.role)) {
          return res.status(403).json({ success: false, message: 'Access denied' });
        }
        entity = await Staff.findByPk(decoded.id);
      } else if (decoded.role === 'admin') {
        if (roles.length && !roles.includes('admin')) {
          return res.status(403).json({ success: false, message: 'Access denied' });
        }
        entity = await Admin.findByPk(decoded.id);
      }

      if (!entity || !entity.is_active) {
        return res.status(401).json({ success: false, message: 'Account not found or inactive' });
      }

      req.user = entity;
      req.userRole = decoded.role;
      req.userId = decoded.id;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }
      next(error);
    }
  };
}

module.exports = { authMiddleware };
