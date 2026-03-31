const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Doctor = sequelize.define('Doctor', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  department_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'departments', key: 'id' } },
  username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false, validate: { isEmail: true } },
  first_name: { type: DataTypes.STRING(100), allowNull: false },
  last_name: { type: DataTypes.STRING(100), allowNull: false },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  qualification: { type: DataTypes.STRING(200), allowNull: true },
  specialization: { type: DataTypes.STRING(200), allowNull: true },
  experience_years: { type: DataTypes.INTEGER, defaultValue: 0 },
  patient_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  consultation_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  bio: { type: DataTypes.TEXT, allowNull: true },
  profile_image: { type: DataTypes.STRING, allowNull: true },
  available_days: {
    type: DataTypes.JSONB,
    defaultValue: [1, 2, 3, 4, 5],
    comment: '0=Sun, 1=Mon, ... 6=Sat',
  },
  slot_start_time: { type: DataTypes.STRING(5), defaultValue: '09:00' },
  slot_end_time: { type: DataTypes.STRING(5), defaultValue: '17:00' },
  slot_duration_minutes: { type: DataTypes.INTEGER, defaultValue: 30 },
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
  total_reviews: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  refresh_token: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'doctors',
  hooks: {
    beforeCreate: async (doc) => {
      if (doc.password_hash && !doc.password_hash.startsWith('$2')) {
        doc.password_hash = await bcrypt.hash(doc.password_hash, 12);
      }
    },
    beforeUpdate: async (doc) => {
      if (doc.changed('password_hash') && !doc.password_hash.startsWith('$2')) {
        doc.password_hash = await bcrypt.hash(doc.password_hash, 12);
      }
    },
  },
});

Doctor.prototype.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};

Doctor.prototype.toSafeJSON = function() {
  const obj = this.toJSON();
  delete obj.password_hash;
  delete obj.refresh_token;
  return obj;
};

module.exports = Doctor;
