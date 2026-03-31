const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pin_hash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  account_type: {
    type: DataTypes.ENUM('individual', 'child', 'parent', 'guardian'),
    defaultValue: 'individual',
  },
  guardian_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  is_email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  email_otp: {
    type: DataTypes.STRING(6),
    allowNull: true,
  },
  phone_otp: {
    type: DataTypes.STRING(6),
    allowNull: true,
  },
  otp_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash && !user.password_hash.startsWith('$2')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
      if (user.pin_hash && !user.pin_hash.startsWith('$2')) {
        user.pin_hash = await bcrypt.hash(user.pin_hash, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash') && user.password_hash && !user.password_hash.startsWith('$2')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
      if (user.changed('pin_hash') && user.pin_hash && !user.pin_hash.startsWith('$2')) {
        user.pin_hash = await bcrypt.hash(user.pin_hash, 12);
      }
    },
  },
});

User.prototype.comparePassword = async function(password) {
  if (!this.password_hash) return false;
  return bcrypt.compare(password, this.password_hash);
};

User.prototype.comparePin = async function(pin) {
  if (!this.pin_hash) return false;
  return bcrypt.compare(pin, this.pin_hash);
};

User.prototype.toSafeJSON = function() {
  const obj = this.toJSON();
  delete obj.password_hash;
  delete obj.pin_hash;
  delete obj.email_otp;
  delete obj.phone_otp;
  delete obj.refresh_token;
  return obj;
};

module.exports = User;
