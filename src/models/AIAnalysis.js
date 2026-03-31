const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AIAnalysis = sequelize.define('AIAnalysis', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  document_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'documents', key: 'id' },
    onDelete: 'SET NULL',
  },
  analysis_type: {
    type: DataTypes.ENUM('document', 'symptom', 'chat', 'recommendation'),
    allowNull: false,
  },
  input_data: { type: DataTypes.JSONB, allowNull: true },
  result: { type: DataTypes.JSONB, allowNull: false },
  confidence_score: { type: DataTypes.FLOAT, allowNull: true },
  summary: { type: DataTypes.TEXT, allowNull: true },
  recommended_specialty: { type: DataTypes.STRING, allowNull: true },
  urgency_level: {
    type: DataTypes.ENUM('routine', 'soon', 'urgent', 'emergency'),
    defaultValue: 'routine',
  },
  model_used: { type: DataTypes.STRING, defaultValue: 'gemini-1.5-flash' },
}, {
  tableName: 'ai_analyses',
  indexes: [
    { fields: ['patient_id'] },
    { fields: ['document_id'] },
    { fields: ['analysis_type'] },
  ],
});

const ChatMessage = sequelize.define('ChatMessage', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  session_id: { type: DataTypes.STRING(128), allowNull: false },
  role: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  metadata: { type: DataTypes.JSONB, defaultValue: {} },
}, {
  tableName: 'chat_messages',
  indexes: [{ fields: ['patient_id', 'session_id'] }],
});

module.exports = { AIAnalysis, ChatMessage };
