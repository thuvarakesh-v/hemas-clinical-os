const { User, Doctor, Staff, Admin, Department, Allergy, Condition, Appointment, Document, AIAnalysis, MedicalProfile, sequelize } = require('../models');
const { Op } = require('sequelize');

// ── DASHBOARD ─────────────────────────────────────────────────
async function getDashboard(req, res) {
  const [users, doctors, staff, appointments, documents] = await Promise.all([
    User.count({ where: { is_active: true } }),
    Doctor.count({ where: { is_active: true } }),
    Staff.count({ where: { is_active: true } }),
    Appointment.count(),
    Document.count(),
  ]);

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const [todayAppointments, pendingAppointments, recentUsers] = await Promise.all([
    Appointment.count({ where: { scheduled_date: new Date().toISOString().split('T')[0] } }),
    Appointment.count({ where: { status: 'pending' } }),
    User.count({ where: { created_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 3600 * 1000) } } }),
  ]);

  res.json({
    success: true,
    data: {
      stats: { users, doctors, staff, appointments, documents, todayAppointments, pendingAppointments, newUsersThisWeek: recentUsers },
    },
  });
}

// ── USERS ─────────────────────────────────────────────────────
async function getUsers(req, res) {
  const { search, page = 1, limit = 20, isActive } = req.query;
  const where = {};
  if (isActive !== undefined) where.is_active = isActive === 'true';
  if (search) {
    where[Op.or] = [
      { email: { [Op.iLike]: `%${search}%` } },
      { phone: { [Op.iLike]: `%${search}%` } },
    ];
  }
  const { count, rows } = await User.findAndCountAll({
    where,
    include: [{ model: MedicalProfile, as: 'medicalProfile', required: false }],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });
  res.json({ success: true, data: { users: rows.map(u => u.toSafeJSON()), pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } } });
}

async function getUserById(req, res) {
  const user = await User.findByPk(req.params.id, {
    include: [{ model: MedicalProfile, as: 'medicalProfile' }],
  });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user.toSafeJSON() });
}

async function toggleUserStatus(req, res) {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  await user.update({ is_active: !user.is_active });
  res.json({ success: true, message: `User ${user.is_active ? 'activated' : 'deactivated'}`, data: user.toSafeJSON() });
}

// ── DOCTORS ───────────────────────────────────────────────────
async function getDoctors(req, res) {
  const { search, departmentId, page = 1, limit = 20 } = req.query;
  const where = {};
  if (departmentId) where.department_id = departmentId;
  if (search) {
    where[Op.or] = [
      { first_name: { [Op.iLike]: `%${search}%` } },
      { last_name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { specialization: { [Op.iLike]: `%${search}%` } },
    ];
  }
  const { count, rows } = await Doctor.findAndCountAll({
    where,
    include: [{ model: Department, as: 'department', required: false }],
    attributes: { exclude: ['password_hash', 'refresh_token'] },
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });
  res.json({ success: true, data: { doctors: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } } });
}

async function createDoctor(req, res) {
  const { username, password, email, firstName, lastName, phone, qualification, specialization, experienceYears, departmentId, consultationFee, bio, availableDays, slotStartTime, slotEndTime, slotDurationMinutes } = req.body;
  
  const existing = await Doctor.findOne({ where: { [Op.or]: [{ email }, { username }] } });
  if (existing) return res.status(409).json({ success: false, message: 'Doctor with this email/username already exists' });

  const doctor = await Doctor.create({
    username, password_hash: password, email, first_name: firstName, last_name: lastName,
    phone, qualification, specialization, experience_years: experienceYears || 0,
    department_id: departmentId || null, consultation_fee: consultationFee || 0,
    bio, available_days: availableDays || [1, 2, 3, 4, 5],
    slot_start_time: slotStartTime || '09:00', slot_end_time: slotEndTime || '17:00',
    slot_duration_minutes: slotDurationMinutes || 30,
  });

  res.status(201).json({ success: true, message: 'Doctor created', data: doctor.toSafeJSON() });
}

async function updateDoctor(req, res) {
  const doctor = await Doctor.findByPk(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

  const allowed = ['first_name', 'last_name', 'email', 'phone', 'qualification', 'specialization', 'experience_years', 'department_id', 'consultation_fee', 'bio', 'available_days', 'slot_start_time', 'slot_end_time', 'slot_duration_minutes', 'is_active', 'rating'];
  const camelToSnake = { firstName: 'first_name', lastName: 'last_name', departmentId: 'department_id', experienceYears: 'experience_years', consultationFee: 'consultation_fee', availableDays: 'available_days', slotStartTime: 'slot_start_time', slotEndTime: 'slot_end_time', slotDurationMinutes: 'slot_duration_minutes', isActive: 'is_active' };

  const updates = {};
  for (const [key, value] of Object.entries(req.body)) {
    const snakeKey = camelToSnake[key] || key;
    if (allowed.includes(snakeKey)) updates[snakeKey] = value;
  }
  if (req.body.password) updates.password_hash = req.body.password;

  await doctor.update(updates);
  res.json({ success: true, message: 'Doctor updated', data: doctor.toSafeJSON() });
}

async function deleteDoctor(req, res) {
  const doctor = await Doctor.findByPk(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  await doctor.update({ is_active: false });
  res.json({ success: true, message: 'Doctor deactivated' });
}

// ── STAFF ─────────────────────────────────────────────────────
async function getStaff(req, res) {
  const { search, role, page = 1, limit = 20 } = req.query;
  const where = {};
  if (role) where.role = role;
  if (search) {
    where[Op.or] = [
      { first_name: { [Op.iLike]: `%${search}%` } },
      { last_name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }
  const { count, rows } = await Staff.findAndCountAll({
    where, include: [{ model: Department, as: 'department', required: false }],
    order: [['created_at', 'DESC']], limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
  });
  res.json({ success: true, data: { staff: rows.map(s => s.toSafeJSON()), pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } } });
}

async function createStaff(req, res) {
  const { username, password, email, firstName, lastName, phone, role, departmentId, employeeId } = req.body;
  const existing = await Staff.findOne({ where: { [Op.or]: [{ email }, { username }] } });
  if (existing) return res.status(409).json({ success: false, message: 'Staff with this email/username already exists' });

  const staff = await Staff.create({
    username, password_hash: password, email, first_name: firstName, last_name: lastName,
    phone, role: role || 'medical_staff', department_id: departmentId || null, employee_id: employeeId || null,
  });
  res.status(201).json({ success: true, message: 'Staff created', data: staff.toSafeJSON() });
}

async function updateStaff(req, res) {
  const staff = await Staff.findByPk(req.params.id);
  if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
  const updates = {};
  const map = { firstName: 'first_name', lastName: 'last_name', departmentId: 'department_id', employeeId: 'employee_id', isActive: 'is_active' };
  for (const [k, v] of Object.entries(req.body)) { updates[map[k] || k] = v; }
  if (req.body.password) updates.password_hash = req.body.password;
  delete updates.username;
  await staff.update(updates);
  res.json({ success: true, message: 'Staff updated', data: staff.toSafeJSON() });
}

async function deleteStaff(req, res) {
  const staff = await Staff.findByPk(req.params.id);
  if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
  await staff.update({ is_active: false });
  res.json({ success: true, message: 'Staff deactivated' });
}

// ── DEPARTMENTS ───────────────────────────────────────────────
async function getDepartments(req, res) {
  const depts = await Department.findAll({ order: [['name', 'ASC']] });
  res.json({ success: true, data: depts });
}

async function createDepartment(req, res) {
  const { name, description, icon } = req.body;
  const dept = await Department.create({ name, description, icon });
  res.status(201).json({ success: true, data: dept });
}

async function updateDepartment(req, res) {
  const dept = await Department.findByPk(req.params.id);
  if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
  await dept.update(req.body);
  res.json({ success: true, data: dept });
}

async function deleteDepartment(req, res) {
  const dept = await Department.findByPk(req.params.id);
  if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
  await dept.update({ is_active: false });
  res.json({ success: true, message: 'Department deactivated' });
}

// ── ALLERGIES & CONDITIONS MASTER ────────────────────────────
async function getAllergies(req, res) {
  const allergies = await Allergy.findAll({ order: [['name', 'ASC']] });
  res.json({ success: true, data: allergies });
}

async function createAllergy(req, res) {
  const { name, category, description } = req.body;
  const a = await Allergy.create({ name, category: category || 'other', description });
  res.status(201).json({ success: true, data: a });
}

async function getConditions(req, res) {
  const conditions = await Condition.findAll({ order: [['name', 'ASC']] });
  res.json({ success: true, data: conditions });
}

async function createCondition(req, res) {
  const { name, category, description, icdCode } = req.body;
  const c = await Condition.create({ name, category, description, icd_code: icdCode });
  res.status(201).json({ success: true, data: c });
}

// ── APPOINTMENTS (admin view) ─────────────────────────────────
async function getAllAppointments(req, res) {
  const { status, date, doctorId, patientId, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;
  if (date) where.scheduled_date = date;
  if (doctorId) where.doctor_id = doctorId;
  if (patientId) where.patient_id = patientId;

  const { count, rows } = await Appointment.findAndCountAll({
    where,
    include: [
      { model: Doctor, as: 'doctor', attributes: { exclude: ['password_hash', 'refresh_token'] } },
      { model: User, as: 'patient', include: [{ model: MedicalProfile, as: 'medicalProfile' }] },
    ],
    order: [['scheduled_date', 'DESC'], ['scheduled_time', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  res.json({ success: true, data: { appointments: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } } });
}

// ── ADMINS ────────────────────────────────────────────────────
async function getAdmins(req, res) {
  const admins = await Admin.findAll({ attributes: { exclude: ['password_hash', 'refresh_token'] } });
  res.json({ success: true, data: admins });
}

async function createAdmin(req, res) {
  const { username, password, email, firstName, lastName, isSuperAdmin } = req.body;
  if (!req.user.is_super_admin) return res.status(403).json({ success: false, message: 'Only super admins can create admins' });

  const a = await Admin.create({
    username, password_hash: password, email,
    first_name: firstName, last_name: lastName,
    is_super_admin: isSuperAdmin || false,
  });
  res.status(201).json({ success: true, data: a.toSafeJSON() });
}

module.exports = {
  getDashboard, getUsers, getUserById, toggleUserStatus,
  getDoctors, createDoctor, updateDoctor, deleteDoctor,
  getStaff, createStaff, updateStaff, deleteStaff,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getAllergies, createAllergy, getConditions, createCondition,
  getAllAppointments, getAdmins, createAdmin,
};
