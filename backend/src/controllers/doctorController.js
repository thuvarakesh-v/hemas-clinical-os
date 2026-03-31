const { Doctor, Department, Appointment, User, MedicalProfile, UserAllergy, UserCondition, Allergy, Condition, Document, AIAnalysis } = require('../models');
const { Op } = require('sequelize');

async function getAllDoctors(req, res) {
  const { departmentId, search, specialization, page = 1, limit = 20 } = req.query;

  const where = { is_active: true };
  if (departmentId) where.department_id = departmentId;
  if (specialization) where.specialization = { [Op.iLike]: `%${specialization}%` };
  if (search) {
    where[Op.or] = [
      { first_name: { [Op.iLike]: `%${search}%` } },
      { last_name: { [Op.iLike]: `%${search}%` } },
      { specialization: { [Op.iLike]: `%${search}%` } },
      { qualification: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Doctor.findAndCountAll({
    where,
    include: [{ model: Department, as: 'department', required: false }],
    attributes: { exclude: ['password_hash', 'refresh_token'] },
    order: [['rating', 'DESC'], ['experience_years', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  res.json({
    success: true,
    data: {
      doctors: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) },
    },
  });
}

async function getDoctorById(req, res) {
  const { id } = req.params;
  const doctor = await Doctor.findOne({
    where: { id, is_active: true },
    include: [{ model: Department, as: 'department' }],
    attributes: { exclude: ['password_hash', 'refresh_token'] },
  });
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  res.json({ success: true, data: doctor });
}

async function getDoctorProfile(req, res) {
  const doctor = await Doctor.findByPk(req.userId, {
    include: [{ model: Department, as: 'department' }],
  });
  res.json({ success: true, data: doctor.toSafeJSON() });
}

async function updateDoctorProfile(req, res) {
  const doctor = await Doctor.findByPk(req.userId);
  // Accept both snake_case and camelCase field names
  const camelToSnake = {
    slotStartTime: 'slot_start_time',
    slotEndTime: 'slot_end_time',
    slotDurationMinutes: 'slot_duration_minutes',
    availableDays: 'available_days',
    consultationFee: 'consultation_fee',
  };
  const allowed = ['bio', 'phone', 'consultation_fee', 'available_days',
                   'slot_start_time', 'slot_end_time', 'slot_duration_minutes'];
  const updates = {};
  for (const [key, value] of Object.entries(req.body)) {
    const snakeKey = camelToSnake[key] || key;
    if (allowed.includes(snakeKey)) updates[snakeKey] = value;
  }
  await doctor.update(updates);
  res.json({ success: true, message: 'Profile updated', data: doctor.toSafeJSON() });
}

async function getMyPatients(req, res) {
  const doctorId = req.userId;

  // Get unique patients who had appointments with this doctor
  const appointments = await Appointment.findAll({
    where: { doctor_id: doctorId, status: { [Op.in]: ['completed', 'confirmed'] } },
    attributes: ['patient_id'],
    group: ['patient_id'],
  });

  const patientIds = appointments.map(a => a.patient_id);

  if (patientIds.length === 0) {
    return res.json({ success: true, data: [] });
  }

  const patients = await User.findAll({
    where: { id: { [Op.in]: patientIds } },
    include: [
      { model: MedicalProfile, as: 'medicalProfile' },
      { model: UserAllergy, as: 'userAllergies', required: false, include: [{ model: Allergy, as: 'allergy', required: false }] },
    ],
  });

  res.json({ success: true, data: patients.map(p => ({ ...p.toSafeJSON(), medicalProfile: p.medicalProfile, userAllergies: p.userAllergies })) });
}

async function getPatientFullProfile(req, res) {
  const { patientId } = req.params;

  const user = await User.findByPk(patientId);
  if (!user) return res.status(404).json({ success: false, message: 'Patient not found' });

  const [profile, allergies, conditions, recentDocs, analyses, appointments] = await Promise.all([
    MedicalProfile.findOne({ where: { user_id: patientId } }),
    UserAllergy.findAll({ where: { user_id: patientId }, include: [{ model: Allergy, as: 'allergy', required: false }] }),
    UserCondition.findAll({ where: { user_id: patientId }, include: [{ model: Condition, as: 'condition', required: false }] }),
    Document.findAll({ where: { patient_id: patientId }, limit: 10, order: [['document_date', 'DESC']] }),
    AIAnalysis.findAll({ where: { patient_id: patientId }, limit: 5, order: [['created_at', 'DESC']] }),
    Appointment.findAll({
      where: { patient_id: patientId, doctor_id: req.userId },
      limit: 10,
      order: [['scheduled_date', 'DESC']],
    }),
  ]);

  res.json({
    success: true,
    data: {
      user: user.toSafeJSON(),
      profile,
      allergies,
      conditions,
      recentDocuments: recentDocs,
      aiAnalyses: analyses,
      appointments,
    },
  });
}

module.exports = { getAllDoctors, getDoctorById, getDoctorProfile, updateDoctorProfile, getMyPatients, getPatientFullProfile };
