const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MedicalProfile = sequelize.define('MedicalProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false,
  },
  nic: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  blood_group: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'),
    defaultValue: 'Unknown',
  },
  height_cm: { type: DataTypes.FLOAT, allowNull: true },
  weight_kg: { type: DataTypes.FLOAT, allowNull: true },
  normal_heart_rate_min: { type: DataTypes.INTEGER, defaultValue: 60 },
  normal_heart_rate_max: { type: DataTypes.INTEGER, defaultValue: 100 },
  normal_bp_systolic: { type: DataTypes.INTEGER, defaultValue: 120 },
  normal_bp_diastolic: { type: DataTypes.INTEGER, defaultValue: 80 },
  normal_temperature: { type: DataTypes.FLOAT, defaultValue: 37.0 },
  normal_oxygen_saturation: { type: DataTypes.INTEGER, defaultValue: 98 },
  emergency_contact_name: { type: DataTypes.STRING, allowNull: true },
  emergency_contact_phone: { type: DataTypes.STRING(20), allowNull: true },
  emergency_contact_relation: { type: DataTypes.STRING(50), allowNull: true },
  profile_image: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'medical_profiles',
});

module.exports = MedicalProfile;
