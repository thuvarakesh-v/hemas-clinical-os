const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_changeme';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refreshsecret_changeme';

function generateTokens(payload) {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
  return { accessToken, refreshToken };
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

function getOTPExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

let transporter = null;
function getMailer() {
  if (!transporter && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendOTPEmail(email, otp, purpose = 'verification') {
  const mailer = getMailer();
  if (!mailer) {
    console.log(`[DEV] OTP for ${email}: ${otp}`);
    return true;
  }
  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || 'noreply@hospital.com',
      to: email,
      subject: `Your Hospital System OTP - ${purpose}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <h2 style="color:#2563eb;">Hospital System</h2>
          <p>Your OTP for ${purpose} is:</p>
          <h1 style="background:#f1f5f9;padding:20px;text-align:center;letter-spacing:8px;color:#1e40af;">${otp}</h1>
          <p>This OTP expires in 10 minutes.</p>
          <p style="color:#6b7280;font-size:12px;">If you did not request this, please ignore this email.</p>
        </div>`,
    });
    return true;
  } catch (error) {
    console.error('Email error:', error.message);
    console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
    return true;
  }
}

module.exports = { generateTokens, verifyAccessToken, verifyRefreshToken, generateOTP, getOTPExpiry, sendOTPEmail };
