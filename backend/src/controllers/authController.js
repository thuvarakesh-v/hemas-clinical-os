const { User, MedicalProfile, Doctor, Staff, Admin } = require('../models');
const {
  generateTokens, verifyRefreshToken, generateOTP, getOTPExpiry, sendOTPEmail,
} = require('../services/authService');

// ── PATIENT AUTH ──────────────────────────────────────────────

async function patientRegister(req, res) {
  const { email, phone, password, accountType } = req.body;

  // ── DEV BYPASS: set SKIP_OTP=true in .env to skip verification ──
  if (process.env.SKIP_OTP === 'true') {
    if (!email && !phone) return res.status(400).json({ success: false, message: 'Email or phone required' });
    const existing = await User.findOne({ where: email ? { email } : { phone } });
    if (existing) return res.status(409).json({ success: false, message: 'Account already exists' });
    const user = await User.create({
      email: email || null, phone: phone || null,
      password_hash: password, account_type: accountType || 'individual',
      is_email_verified: true, is_phone_verified: true,
    });
    const { accessToken, refreshToken } = generateTokens({ id: user.id, role: 'patient' });
    await user.update({ refresh_token: refreshToken, last_login: new Date() });
    console.log(`[DEV] OTP bypassed for new user: ${email || phone}`);
    return res.status(201).json({
      success: true, message: 'Registered successfully (OTP bypassed - dev mode)',
      data: { accessToken, refreshToken, user: user.toSafeJSON(), needsProfile: true },
    });
  }

  if (!email && !phone) {
    return res.status(400).json({ success: false, message: 'Email or phone required' });
  }

  const existing = await User.findOne({
    where: email ? { email } : { phone },
  });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Account already exists with this email/phone' });
  }

  const otp = generateOTP();
  const user = await User.create({
    email: email || null,
    phone: phone || null,
    password_hash: password,
    account_type: accountType || 'individual',
    email_otp: email ? otp : null,
    phone_otp: phone && !email ? otp : null,
    otp_expires_at: getOTPExpiry(10),
  });

  if (email) await sendOTPEmail(email, otp, 'email verification');
  else console.log(`[SMS] Send OTP ${otp} to ${phone}`);

  res.status(201).json({
    success: true,
    message: 'Registration started. Please verify your email/phone with the OTP sent.',
    data: { userId: user.id, verificationMethod: email ? 'email' : 'phone' },
  });
}

async function verifyOTP(req, res) {
  const { userId, otp, type } = req.body;

  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (new Date() > new Date(user.otp_expires_at)) {
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  const storedOTP = type === 'phone' ? user.phone_otp : user.email_otp;
  if (storedOTP !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  await user.update({
    is_email_verified: type !== 'phone' ? true : user.is_email_verified,
    is_phone_verified: type === 'phone' ? true : user.is_phone_verified,
    email_otp: null,
    phone_otp: null,
    otp_expires_at: null,
  });

  const { accessToken, refreshToken } = generateTokens({ id: user.id, role: 'patient' });
  await user.update({ refresh_token: refreshToken });

  res.json({
    success: true,
    message: 'Verification successful',
    data: { accessToken, refreshToken, user: user.toSafeJSON(), needsProfile: true },
  });
}

async function resendOTP(req, res) {
  const { userId } = req.body;
  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const otp = generateOTP();
  const updates = { otp_expires_at: getOTPExpiry(10) };
  if (user.email) { updates.email_otp = otp; await sendOTPEmail(user.email, otp); }
  else { updates.phone_otp = otp; console.log(`[SMS] OTP ${otp} to ${user.phone}`); }

  await user.update(updates);
  res.json({ success: true, message: 'OTP resent successfully' });
}

async function patientLogin(req, res) {
  const { identifier, password, pin } = req.body;

  const user = await User.findOne({
    where: identifier.includes('@') ? { email: identifier } : { phone: identifier },
  });
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  let isValid = false;
  if (pin) isValid = await user.comparePin(pin);
  else if (password) isValid = await user.comparePassword(password);

  if (!isValid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const profile = await MedicalProfile.findOne({ where: { user_id: user.id } });
  const { accessToken, refreshToken } = generateTokens({ id: user.id, role: 'patient' });
  await user.update({ refresh_token: refreshToken, last_login: new Date() });

  res.json({
    success: true,
    message: 'Login successful',
    data: { accessToken, refreshToken, user: user.toSafeJSON(), hasProfile: !!profile },
  });
}

// ── STAFF / DOCTOR / ADMIN LOGIN ──────────────────────────────

async function staffLogin(req, res) {
  const { username, password } = req.body;

  // Try Doctor
  let entity = await Doctor.findOne({ where: { username } });
  let role = 'doctor';

  if (!entity) { entity = await Staff.findOne({ where: { username } }); role = entity?.role; }
  if (!entity) { entity = await Admin.findOne({ where: { username } }); role = 'admin'; }

  if (!entity) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  if (!entity.is_active) return res.status(401).json({ success: false, message: 'Account is inactive' });

  const isValid = await entity.comparePassword(password);
  if (!isValid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const { accessToken, refreshToken } = generateTokens({ id: entity.id, role });
  await entity.update({ refresh_token: refreshToken, last_login: new Date() });

  res.json({
    success: true,
    message: 'Login successful',
    data: { accessToken, refreshToken, user: entity.toSafeJSON(), role },
  });
}

async function refreshToken(req, res) {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'Refresh token required' });

  try {
    const decoded = verifyRefreshToken(token);
    const { accessToken, refreshToken: newRefresh } = generateTokens({ id: decoded.id, role: decoded.role });

    // Update stored token for the entity
    const models = { patient: User, doctor: Doctor, admin: Admin };
    const Model = models[decoded.role] || Staff;
    await Model.update({ refresh_token: newRefresh }, { where: { id: decoded.id } });

    res.json({ success: true, data: { accessToken, refreshToken: newRefresh } });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
}

async function logout(req, res) {
  const { id, role } = req.user;
  const models = { patient: User, doctor: Doctor, admin: Admin };
  const Model = models[role] || Staff;
  await Model.update({ refresh_token: null }, { where: { id } });
  res.json({ success: true, message: 'Logged out successfully' });
}

module.exports = { patientRegister, verifyOTP, resendOTP, patientLogin, staffLogin, refreshToken, logout };
