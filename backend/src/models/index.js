const { sequelize } = require('../config/database');
const User = require('./User');
const MedicalProfile = require('./MedicalProfile');
const { Allergy, UserAllergy, Condition, UserCondition, Department } = require('./MedicalMeta');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');
const Document = require('./Document');
const { AIAnalysis, ChatMessage } = require('./AIAnalysis');
const { Staff, Admin, EmergencyQR } = require('./Staff');

// User associations
User.hasOne(MedicalProfile, { foreignKey: 'user_id', as: 'medicalProfile' });
MedicalProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(EmergencyQR, { foreignKey: 'user_id', as: 'emergencyQR' });
EmergencyQR.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.belongsToMany(Allergy, { through: UserAllergy, foreignKey: 'user_id', as: 'allergies' });
Allergy.belongsToMany(User, { through: UserAllergy, foreignKey: 'allergy_id', as: 'users' });
User.hasMany(UserAllergy, { foreignKey: 'user_id', as: 'userAllergies' });
UserAllergy.belongsTo(User, { foreignKey: 'user_id' });
UserAllergy.belongsTo(Allergy, { foreignKey: 'allergy_id', as: 'allergy' });

User.belongsToMany(Condition, { through: UserCondition, foreignKey: 'user_id', as: 'conditions' });
Condition.belongsToMany(User, { through: UserCondition, foreignKey: 'condition_id', as: 'users' });
User.hasMany(UserCondition, { foreignKey: 'user_id', as: 'userConditions' });
UserCondition.belongsTo(User, { foreignKey: 'user_id' });
UserCondition.belongsTo(Condition, { foreignKey: 'condition_id', as: 'condition' });

// Guardian / child
User.hasMany(User, { foreignKey: 'guardian_id', as: 'dependents' });
User.belongsTo(User, { foreignKey: 'guardian_id', as: 'guardian' });

// Doctor associations
Doctor.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Department.hasMany(Doctor, { foreignKey: 'department_id', as: 'doctors' });

Doctor.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

User.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });

// Document associations
User.hasMany(Document, { foreignKey: 'patient_id', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });

// AI Analysis associations
User.hasMany(AIAnalysis, { foreignKey: 'patient_id', as: 'analyses' });
AIAnalysis.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });
Document.hasMany(AIAnalysis, { foreignKey: 'document_id', as: 'analyses' });
AIAnalysis.belongsTo(Document, { foreignKey: 'document_id', as: 'document' });

User.hasMany(ChatMessage, { foreignKey: 'patient_id', as: 'chatMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });

// Staff associations
Staff.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Department.hasMany(Staff, { foreignKey: 'department_id', as: 'staff' });

module.exports = {
  sequelize,
  User,
  MedicalProfile,
  Allergy,
  UserAllergy,
  Condition,
  UserCondition,
  Department,
  Doctor,
  Appointment,
  Document,
  AIAnalysis,
  ChatMessage,
  Staff,
  Admin,
  EmergencyQR,
};
