const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Controllers
const authCtrl = require('../controllers/authController');
const patientCtrl = require('../controllers/patientController');
const docCtrl = require('../controllers/documentController');
const aiCtrl = require('../controllers/aiController');
const apptCtrl = require('../controllers/appointmentController');
const doctorCtrl = require('../controllers/doctorController');
const adminCtrl = require('../controllers/adminController');
const { User, MedicalProfile, sequelize: sq } = require('../models');
const { Op } = require('sequelize');

// ── AI HEALTH (public, no auth) ─────────────────────────────
router.get('/ai/health', aiCtrl.aiHealthCheck);

// ── AUTH ──────────────────────────────────────────────────────
router.post('/auth/patient/register', authCtrl.patientRegister);
router.post('/auth/patient/verify-otp', authCtrl.verifyOTP);
router.post('/auth/patient/resend-otp', authCtrl.resendOTP);
router.post('/auth/patient/login', authCtrl.patientLogin);
router.post('/auth/staff/login', authCtrl.staffLogin);
router.post('/auth/refresh', authCtrl.refreshToken);
router.post('/auth/logout', authMiddleware(), authCtrl.logout);

// ── PATIENT PROFILE ────────────────────────────────────────────
router.post('/patient/profile', authMiddleware(['patient']), patientCtrl.createProfile);
router.get('/patient/profile', authMiddleware(['patient']), patientCtrl.getProfile);
router.put('/patient/profile', authMiddleware(['patient']), patientCtrl.updateProfile);
router.post('/patient/allergies', authMiddleware(['patient']), patientCtrl.addAllergy);
router.delete('/patient/allergies/:id', authMiddleware(['patient']), patientCtrl.removeAllergy);
router.post('/patient/conditions', authMiddleware(['patient']), patientCtrl.addCondition);
router.delete('/patient/conditions/:id', authMiddleware(['patient']), patientCtrl.removeCondition);

// Emergency QR (public endpoint - no auth)
router.get('/emergency/:token', patientCtrl.getEmergencyData);

// ── DOCUMENTS (patient) ────────────────────────────────────────
router.post('/documents/upload', authMiddleware(['patient']), upload.single('file'), docCtrl.uploadDocument);
router.get('/documents', authMiddleware(['patient']), docCtrl.getDocuments);
router.get('/documents/:id', authMiddleware(['patient']), docCtrl.getDocumentById);
router.get('/documents/:id/analysis', authMiddleware(['patient']), docCtrl.getDocumentAnalysis);
router.delete('/documents/:id', authMiddleware(['patient']), docCtrl.deleteDocument);

// ── AI ENGINE ─────────────────────────────────────────────────
router.post('/ai/chat', authMiddleware(['patient']), aiCtrl.chat);
router.post('/ai/symptoms', authMiddleware(['patient']), aiCtrl.analyzeSymptoms);
router.get('/ai/sessions', authMiddleware(['patient']), aiCtrl.getChatSessions);
router.get('/ai/sessions/:sessionId', authMiddleware(['patient']), aiCtrl.getChatHistory);
router.get('/ai/analyses', authMiddleware(['patient']), aiCtrl.getPatientAnalyses);
router.get('/ai/recommended-doctors', authMiddleware(['patient']), aiCtrl.getRecommendedDoctors);
router.post('/ai/agent', authMiddleware(['patient']), aiCtrl.agentAction);

// ── DOCTORS (public + patient) ────────────────────────────────
router.get('/doctors', doctorCtrl.getAllDoctors);
router.get('/doctors/:id', doctorCtrl.getDoctorById);

// ── APPOINTMENTS ───────────────────────────────────────────────
router.get('/appointments/slots/:doctorId', apptCtrl.getDoctorSlots);
router.post('/appointments', authMiddleware(['patient']), apptCtrl.bookAppointment);
router.get('/appointments/my', authMiddleware(['patient']), apptCtrl.getPatientAppointments);
router.put('/appointments/:id/cancel', authMiddleware(['patient', 'doctor', 'admin']), apptCtrl.cancelAppointment);

// ── MASTER DATA (public) ───────────────────────────────────────
router.get('/master/allergies', adminCtrl.getAllergies);
router.get('/master/conditions', adminCtrl.getConditions);
router.get('/master/departments', adminCtrl.getDepartments);

// ── DOCTOR ROUTES ─────────────────────────────────────────────
router.get('/doctor/profile', authMiddleware(['doctor']), doctorCtrl.getDoctorProfile);
router.put('/doctor/profile', authMiddleware(['doctor']), doctorCtrl.updateDoctorProfile);
router.get('/doctor/appointments', authMiddleware(['doctor']), apptCtrl.getDoctorAppointments);
router.put('/doctor/appointments/:id', authMiddleware(['doctor']), apptCtrl.updateAppointmentStatus);
router.get('/doctor/patients', authMiddleware(['doctor']), doctorCtrl.getMyPatients);
router.get('/doctor/patients/:patientId', authMiddleware(['doctor']), doctorCtrl.getPatientFullProfile);
router.get('/doctor/patients/:patientId/documents', authMiddleware(['doctor']), docCtrl.getDocuments);
router.get('/doctor/patients/:patientId/analyses', authMiddleware(['doctor']), aiCtrl.getPatientAnalyses);

// ── STAFF ROUTES ──────────────────────────────────────────────
router.post('/staff/documents/upload', authMiddleware(['staff', 'medical_staff', 'medicine_staff', 'lab_technician', 'nurse', 'receptionist', 'doctor']), upload.single('file'), docCtrl.staffUploadDocument);
router.get('/staff/patients', authMiddleware(['staff', 'medical_staff', 'medicine_staff', 'receptionist', 'doctor']), async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const where = { is_active: true };
  if (search) {
    where[Op.or] = [
      { email: { [Op.iLike]: `%${search}%` } },
      { phone: { [Op.iLike]: `%${search}%` } },
      sq.literal(`EXISTS (SELECT 1 FROM medical_profiles mp WHERE mp.user_id = "User".id AND (mp.first_name ILIKE '%${search.replace(/'/g,"''")}%' OR mp.last_name ILIKE '%${search.replace(/'/g,"''")}%' OR mp.nic ILIKE '%${search.replace(/'/g,"''")}%'))`),
    ];
  }
  const { count, rows } = await User.findAndCountAll({
    where,
    include: [{ model: MedicalProfile, as: 'medicalProfile', required: false }],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['created_at', 'DESC']],
    distinct: true,
  });
  res.json({ success: true, data: { patients: rows.map(u => ({ ...u.toSafeJSON(), medicalProfile: u.medicalProfile })), pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } } });
});
router.get('/staff/patients/:patientId', authMiddleware(['staff', 'medical_staff', 'medicine_staff', 'doctor']), doctorCtrl.getPatientFullProfile);
router.get('/staff/appointments', authMiddleware(['staff', 'medical_staff', 'receptionist', 'doctor']), adminCtrl.getAllAppointments);

// ── ADMIN ROUTES ──────────────────────────────────────────────
router.get('/admin/dashboard', authMiddleware(['admin']), adminCtrl.getDashboard);
router.get('/admin/users', authMiddleware(['admin']), adminCtrl.getUsers);
router.get('/admin/users/:id', authMiddleware(['admin']), adminCtrl.getUserById);
router.put('/admin/users/:id/toggle-status', authMiddleware(['admin']), adminCtrl.toggleUserStatus);

router.get('/admin/doctors', authMiddleware(['admin']), adminCtrl.getDoctors);
router.post('/admin/doctors', authMiddleware(['admin']), adminCtrl.createDoctor);
router.put('/admin/doctors/:id', authMiddleware(['admin']), adminCtrl.updateDoctor);
router.delete('/admin/doctors/:id', authMiddleware(['admin']), adminCtrl.deleteDoctor);

router.get('/admin/staff', authMiddleware(['admin']), adminCtrl.getStaff);
router.post('/admin/staff', authMiddleware(['admin']), adminCtrl.createStaff);
router.put('/admin/staff/:id', authMiddleware(['admin']), adminCtrl.updateStaff);
router.delete('/admin/staff/:id', authMiddleware(['admin']), adminCtrl.deleteStaff);

router.get('/admin/departments', authMiddleware(['admin']), adminCtrl.getDepartments);
router.post('/admin/departments', authMiddleware(['admin']), adminCtrl.createDepartment);
router.put('/admin/departments/:id', authMiddleware(['admin']), adminCtrl.updateDepartment);
router.delete('/admin/departments/:id', authMiddleware(['admin']), adminCtrl.deleteDepartment);

router.get('/admin/allergies', authMiddleware(['admin']), adminCtrl.getAllergies);
router.post('/admin/allergies', authMiddleware(['admin']), adminCtrl.createAllergy);
router.get('/admin/conditions', authMiddleware(['admin']), adminCtrl.getConditions);
router.post('/admin/conditions', authMiddleware(['admin']), adminCtrl.createCondition);

router.get('/admin/appointments', authMiddleware(['admin']), adminCtrl.getAllAppointments);
router.get('/admin/admins', authMiddleware(['admin']), adminCtrl.getAdmins);
router.post('/admin/admins', authMiddleware(['admin']), adminCtrl.createAdmin);

module.exports = router;
