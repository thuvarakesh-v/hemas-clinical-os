const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Staff = sequelize.define('Staff', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  first_name: { type: DataTypes.STRING(100), allowNull: false },
  last_name: { type: DataTypes.STRING(100), allowNull: false },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  role: {
    type: DataTypes.ENUM('medical_staff', 'medicine_staff', 'nurse', 'receptionist', 'lab_technician'),
    defaultValue: 'medical_staff',
  },
  department_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'departments', key: 'id' } },
  employee_id: { type: DataTypes.STRING(20), unique: true, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  refresh_token: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'staff',
  hooks: {
    beforeCreate: async (s) => {
      if (s.password_hash && !s.password_hash.startsWith('$2')) {
        s.password_hash = await bcrypt.hash(s.password_hash, 12);
      }
    },
    beforeUpdate: async (s) => {
      if (s.changed('password_hash') && !s.password_hash.startsWith('$2')) {
        s.password_hash = await bcrypt.hash(s.password_hash, 12);
      }
    },
  },
});

Staff.prototype.comparePassword = async function(p) { return bcrypt.compare(p, this.password_hash); };
Staff.prototype.toSafeJSON = function() {
  const obj = this.toJSON();
  delete obj.password_hash;
  delete obj.refresh_token;
  return obj;
};

const Admin = sequelize.define('Admin', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  first_name: { type: DataTypes.STRING(100), allowNull: false },
  last_name: { type: DataTypes.STRING(100), allowNull: false },
  is_super_admin: { type: DataTypes.BOOLEAN, defaultValue: false },
  permissions: { type: DataTypes.JSONB, defaultValue: [] },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  refresh_token: { type: DataTypes.TEXT, allowNull: true },
  last_login: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'admins',
  hooks: {
    beforeCreate: async (a) => {
      if (a.password_hash && !a.password_hash.startsWith('$2')) {
        a.password_hash = await bcrypt.hash(a.password_hash, 12);
      }
    },
    beforeUpdate: async (a) => {
      if (a.changed('password_hash') && !a.password_hash.startsWith('$2')) {
        a.password_hash = await bcrypt.hash(a.password_hash, 12);
      }
    },
  },
});

Admin.prototype.comparePassword = async function(p) { return bcrypt.compare(p, this.password_hash); };
Admin.prototype.toSafeJSON = function() {
  const obj = this.toJSON();
  delete obj.password_hash;
  delete obj.refresh_token;
  return obj;
};

const EmergencyQR = sequelize.define('EmergencyQR', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false, unique: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
  qr_token: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
  allergies: { type: DataTypes.JSONB, defaultValue: [] },
  conditions: { type: DataTypes.JSONB, defaultValue: [] },
  blood_group: { type: DataTypes.STRING(5), allowNull: true },
  emergency_contact: { type: DataTypes.JSONB, allowNull: true },
  past_surgeries: { type: DataTypes.JSONB, defaultValue: [] },
  current_medications: { type: DataTypes.JSONB, defaultValue: [] },
  notes: { type: DataTypes.TEXT, allowNull: true },
  qr_image_path: { type: DataTypes.STRING, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'emergency_qr' });

module.exports = { Staff, Admin, EmergencyQR };
