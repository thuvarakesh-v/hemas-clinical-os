const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Master allergy list
const Allergy = sequelize.define('Allergy', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  category: {
    type: DataTypes.ENUM('food', 'drug', 'environmental', 'insect', 'latex', 'other'),
    defaultValue: 'other',
  },
  description: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'allergies' });

// User <-> Allergy junction
const UserAllergy = sequelize.define('UserAllergy', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
  allergy_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'allergies', key: 'id' } },
  custom_allergy: { type: DataTypes.STRING(100), allowNull: true },
  severity: { type: DataTypes.ENUM('mild', 'moderate', 'severe'), defaultValue: 'moderate' },
  reaction: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'user_allergies' });

// Master condition list
const Condition = sequelize.define('Condition', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  category: { type: DataTypes.STRING(100), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  icd_code: { type: DataTypes.STRING(20), allowNull: true },
}, { tableName: 'conditions' });

// User <-> Condition junction
const UserCondition = sequelize.define('UserCondition', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
  condition_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'conditions', key: 'id' } },
  custom_condition: { type: DataTypes.STRING(100), allowNull: true },
  diagnosed_date: { type: DataTypes.DATEONLY, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'user_conditions' });

// Hospital departments / specialties
const Department = sequelize.define('Department', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  icon: { type: DataTypes.STRING, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'departments' });

module.exports = { Allergy, UserAllergy, Condition, UserCondition, Department };
