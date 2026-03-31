const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  doctor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'doctors', key: 'id' },
  },
  scheduled_date: { type: DataTypes.DATEONLY, allowNull: false },
  scheduled_time: { type: DataTypes.STRING(5), allowNull: false },
  duration_minutes: { type: DataTypes.INTEGER, defaultValue: 30 },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show'),
    defaultValue: 'pending',
  },
  reason: { type: DataTypes.TEXT, allowNull: true },
  symptoms: { type: DataTypes.JSONB, defaultValue: [] },
  notes: { type: DataTypes.TEXT, allowNull: true },
  doctor_notes: { type: DataTypes.TEXT, allowNull: true },
  prescription: { type: DataTypes.JSONB, defaultValue: null },
  cancelled_by: { type: DataTypes.ENUM('patient', 'doctor', 'admin'), allowNull: true },
  cancellation_reason: { type: DataTypes.TEXT, allowNull: true },
  is_online: { type: DataTypes.BOOLEAN, defaultValue: false },
  meeting_link: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'appointments',
  indexes: [
    { fields: ['patient_id'] },
    { fields: ['doctor_id'] },
    { fields: ['scheduled_date'] },
    { fields: ['status'] },
  ],
});

module.exports = Appointment;
