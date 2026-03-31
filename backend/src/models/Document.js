const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  uploaded_by_type: {
    type: DataTypes.ENUM('patient', 'staff', 'doctor'),
    defaultValue: 'patient',
  },
  uploaded_by_id: { type: DataTypes.UUID, allowNull: true },
  original_name: { type: DataTypes.STRING, allowNull: false },
  filename: { type: DataTypes.STRING, allowNull: false },
  file_path: { type: DataTypes.STRING, allowNull: false },
  file_size: { type: DataTypes.INTEGER, allowNull: true },
  mime_type: { type: DataTypes.STRING, allowNull: true },
  category: {
    type: DataTypes.ENUM('lab_report', 'prescription', 'imaging', 'discharge', 'consultation', 'vaccination', 'other'),
    defaultValue: 'other',
  },
  document_date: { type: DataTypes.DATEONLY, allowNull: true },
  title: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  raw_text: { type: DataTypes.TEXT, allowNull: true },
  is_ai_analyzed: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_visible_to_patient: { type: DataTypes.BOOLEAN, defaultValue: true },
  tags: { type: DataTypes.JSONB, defaultValue: [] },
}, {
  tableName: 'documents',
  indexes: [
    { fields: ['patient_id'] },
    { fields: ['document_date'] },
    { fields: ['category'] },
  ],
});

module.exports = Document;
