const { Appointment, Doctor, User, MedicalProfile, Department } = require('../models');
const { Op } = require('sequelize');

function generateTimeSlots(startTime, endTime, durationMinutes) {
  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;
  
  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    current += durationMinutes;
  }
  return slots;
}

async function getDoctorSlots(req, res) {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!date) return res.status(400).json({ success: false, message: 'Date required (YYYY-MM-DD)' });

  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor || !doctor.is_active) return res.status(404).json({ success: false, message: 'Doctor not found' });

  const dayOfWeek = new Date(date).getDay();
  if (!doctor.available_days.includes(dayOfWeek)) {
    return res.json({ success: true, data: { slots: [], message: 'Doctor not available on this day' } });
  }

  const allSlots = generateTimeSlots(doctor.slot_start_time, doctor.slot_end_time, doctor.slot_duration_minutes);

  const bookedAppointments = await Appointment.findAll({
    where: {
      doctor_id: doctorId,
      scheduled_date: date,
      status: { [Op.in]: ['pending', 'confirmed'] },
    },
  });

  const bookedTimes = bookedAppointments.map(a => a.scheduled_time);
  const now = new Date();
  const isToday = date === now.toISOString().split('T')[0];

  const slots = allSlots.map(time => {
    const isBooked = bookedTimes.includes(time);
    let isPast = false;
    if (isToday) {
      const [h, m] = time.split(':').map(Number);
      isPast = (h * 60 + m) <= (now.getHours() * 60 + now.getMinutes() + 30);
    }
    return { time, available: !isBooked && !isPast, booked: isBooked, past: isPast };
  });

  res.json({ success: true, data: { slots, doctor: doctor.toSafeJSON() } });
}

async function bookAppointment(req, res) {
  const patientId = req.userId;
  const { doctorId, scheduledDate, scheduledTime, reason, symptoms, isOnline } = req.body;

  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor || !doctor.is_active) return res.status(404).json({ success: false, message: 'Doctor not found' });

  // Check slot availability
  const existing = await Appointment.findOne({
    where: {
      doctor_id: doctorId,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      status: { [Op.in]: ['pending', 'confirmed'] },
    },
  });
  if (existing) return res.status(409).json({ success: false, message: 'This slot is already booked' });

  // Check patient doesn't have another appointment same day same time
  const patientConflict = await Appointment.findOne({
    where: {
      patient_id: patientId,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      status: { [Op.in]: ['pending', 'confirmed'] },
    },
  });
  if (patientConflict) return res.status(409).json({ success: false, message: 'You already have an appointment at this time' });

  const appointment = await Appointment.create({
    patient_id: patientId,
    doctor_id: doctorId,
    scheduled_date: scheduledDate,
    scheduled_time: scheduledTime,
    duration_minutes: doctor.slot_duration_minutes,
    status: 'confirmed',
    reason: reason || null,
    symptoms: symptoms || [],
    is_online: isOnline || false,
  });

  // Increment doctor patient count
  await doctor.increment('patient_count');

  const fullAppointment = await Appointment.findByPk(appointment.id, {
    include: [
      { model: Doctor, as: 'doctor' },
      { model: User, as: 'patient', include: [{ model: MedicalProfile, as: 'medicalProfile' }] },
    ],
  });

  res.status(201).json({ success: true, message: 'Appointment booked successfully', data: fullAppointment });
}

async function getPatientAppointments(req, res) {
  const patientId = req.params.patientId || req.userId;
  const { status, upcoming } = req.query;

  const where = { patient_id: patientId };
  if (status) where.status = status;
  if (upcoming === 'true') {
    where.scheduled_date = { [Op.gte]: new Date().toISOString().split('T')[0] };
    where.status = { [Op.in]: ['pending', 'confirmed'] };
  }

  const appointments = await Appointment.findAll({
    where,
    include: [{ model: Doctor, as: 'doctor', include: [{ model: Department, as: 'department' }] }],
    order: [['scheduled_date', 'DESC'], ['scheduled_time', 'DESC']],
  });

  res.json({ success: true, data: appointments });
}

async function getDoctorAppointments(req, res) {
  const doctorId = req.userId;
  const { date, status, limit = 50, page = 1 } = req.query;

  const where = { doctor_id: doctorId };
  if (date) where.scheduled_date = date;
  if (status) {
    // Support comma-separated status values e.g. "confirmed,pending"
    where.status = status.includes(',') ? { [Op.in]: status.split(',') } : status;
  }

  const appointments = await Appointment.findAll({
    where,
    include: [
      {
        model: User,
        as: 'patient',
        include: [{ model: MedicalProfile, as: 'medicalProfile' }],
      },
    ],
    order: [['scheduled_date', 'ASC'], ['scheduled_time', 'ASC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  res.json({ success: true, data: appointments });
}

async function cancelAppointment(req, res) {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.userId;
  const role = req.userRole;

  const where = { id };
  if (role === 'patient') where.patient_id = userId;
  else if (role === 'doctor') where.doctor_id = userId;

  const appointment = await Appointment.findOne({ where });
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

  if (['completed', 'cancelled'].includes(appointment.status)) {
    return res.status(400).json({ success: false, message: 'Cannot cancel this appointment' });
  }

  await appointment.update({
    status: 'cancelled',
    cancelled_by: role === 'patient' ? 'patient' : role === 'doctor' ? 'doctor' : 'admin',
    cancellation_reason: reason || null,
  });

  res.json({ success: true, message: 'Appointment cancelled', data: appointment });
}

async function updateAppointmentStatus(req, res) {
  const { id } = req.params;
  const { status, doctorNotes, prescription } = req.body;
  const doctorId = req.userId;

  const appointment = await Appointment.findOne({ where: { id, doctor_id: doctorId } });
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

  const updates = {};
  if (status) updates.status = status;
  if (doctorNotes) updates.doctor_notes = doctorNotes;
  if (prescription) updates.prescription = prescription;

  await appointment.update(updates);
  res.json({ success: true, message: 'Appointment updated', data: appointment });
}

module.exports = {
  getDoctorSlots, bookAppointment, getPatientAppointments,
  getDoctorAppointments, cancelAppointment, updateAppointmentStatus,
};
