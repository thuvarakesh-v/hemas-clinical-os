const { v4: uuidv4 } = require('uuid');
const {
  User, MedicalProfile, UserAllergy, UserCondition, Allergy, Condition, EmergencyQR,
} = require('../models');
const { generateEmergencyQR } = require('../services/qrService');

async function createProfile(req, res) {
  const userId = req.userId;
  const {
    firstName, lastName, dateOfBirth, gender, nic,
    bloodGroup, heightCm, weightKg,
    normalHeartRateMin, normalHeartRateMax,
    normalBpSystolic, normalBpDiastolic, normalTemperature, normalOxygenSaturation,
    emergencyContactName, emergencyContactPhone, emergencyContactRelation,
    allergies, conditions,
    pin,
    bloodGroup: bg, // alias
    pastSurgeries, currentMedications, emergencyNotes,
  } = req.body;

  const existing = await MedicalProfile.findOne({ where: { user_id: userId } });
  if (existing) return res.status(409).json({ success: false, message: 'Profile already exists' });

  const profile = await MedicalProfile.create({
    user_id: userId,
    first_name: firstName,
    last_name: lastName,
    date_of_birth: dateOfBirth,
    gender,
    nic: nic || null,
    blood_group: bloodGroup || bg || 'Unknown',
    height_cm: heightCm || null,
    weight_kg: weightKg || null,
    normal_heart_rate_min: normalHeartRateMin || 60,
    normal_heart_rate_max: normalHeartRateMax || 100,
    normal_bp_systolic: normalBpSystolic || 120,
    normal_bp_diastolic: normalBpDiastolic || 80,
    normal_temperature: normalTemperature || 37.0,
    normal_oxygen_saturation: normalOxygenSaturation || 98,
    emergency_contact_name: emergencyContactName || null,
    emergency_contact_phone: emergencyContactPhone || null,
    emergency_contact_relation: emergencyContactRelation || null,
  });

  // Save pin if provided
  if (pin) await User.update({ pin_hash: pin }, { where: { id: userId } });

  // Save allergies
  if (allergies?.length) {
    for (const a of allergies) {
      const ua = { user_id: userId, severity: a.severity || 'moderate' };
      if (a.allergyId) {
        ua.allergy_id = a.allergyId;
      } else {
        ua.custom_allergy = a.name;
      }
      await UserAllergy.create(ua);
    }
  }

  // Save conditions
  if (conditions?.length) {
    for (const c of conditions) {
      const uc = { user_id: userId, is_active: true };
      if (c.conditionId) {
        uc.condition_id = c.conditionId;
      } else {
        uc.custom_condition = c.name;
      }
      await UserCondition.create(uc);
    }
  }

  // Generate Emergency QR
  const qrToken = uuidv4();
  const qrData = await generateEmergencyQR(userId, qrToken, {
    name: `${firstName} ${lastName}`,
    bloodGroup: bloodGroup || 'Unknown',
    allergies: allergies?.map(a => a.name) || [],
    conditions: conditions?.map(c => c.name) || [],
    emergencyContact: { name: emergencyContactName, phone: emergencyContactPhone },
    pastSurgeries: pastSurgeries || [],
    currentMedications: currentMedications || [],
    notes: emergencyNotes || '',
  });

  await EmergencyQR.create({
    user_id: userId,
    qr_token: qrToken,
    allergies: allergies?.map(a => ({ name: a.name, severity: a.severity })) || [],
    conditions: conditions?.map(c => ({ name: c.name })) || [],
    blood_group: bloodGroup || 'Unknown',
    emergency_contact: { name: emergencyContactName, phone: emergencyContactPhone, relation: emergencyContactRelation },
    past_surgeries: pastSurgeries || [],
    current_medications: currentMedications || [],
    notes: emergencyNotes || '',
    qr_image_path: qrData.filePath,
  });

  res.status(201).json({
    success: true,
    message: 'Profile created successfully',
    data: { profile, qrData: { base64: qrData.base64, filePath: qrData.filePath, emergencyUrl: qrData.emergencyUrl } },
  });
}

async function getProfile(req, res) {
  const userId = req.userId;

  const profile = await MedicalProfile.findOne({ where: { user_id: userId } });
  if (!profile) return res.status(404).json({ success: false, message: 'Profile not found', needsSetup: true });

  const userAllergies = await UserAllergy.findAll({
    where: { user_id: userId },
    include: [{ model: Allergy, as: 'allergy', required: false }],
  });

  const userConditions = await UserCondition.findAll({
    where: { user_id: userId },
    include: [{ model: Condition, as: 'condition', required: false }],
  });

  const emergencyQR = await EmergencyQR.findOne({ where: { user_id: userId } });
  const user = await User.findByPk(userId);

  res.json({
    success: true,
    data: {
      user: user.toSafeJSON(),
      profile,
      allergies: userAllergies,
      conditions: userConditions,
      emergencyQR,
    },
  });
}

async function updateProfile(req, res) {
  const userId = req.userId;
  const profile = await MedicalProfile.findOne({ where: { user_id: userId } });
  if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

  const allowedFields = [
    'first_name', 'last_name', 'height_cm', 'weight_kg',
    'normal_heart_rate_min', 'normal_heart_rate_max',
    'normal_bp_systolic', 'normal_bp_diastolic', 'normal_temperature', 'normal_oxygen_saturation',
    'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation', 'notes',
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  // camelCase support
  if (req.body.firstName) updates.first_name = req.body.firstName;
  if (req.body.lastName) updates.last_name = req.body.lastName;

  await profile.update(updates);
  res.json({ success: true, message: 'Profile updated', data: profile });
}

async function getEmergencyData(req, res) {
  const { token } = req.params;
  const qr = await EmergencyQR.findOne({ where: { qr_token: token, is_active: true } });
  if (!qr) return res.status(404).json({ success: false, message: 'Emergency data not found' });

  const profile = await MedicalProfile.findOne({ where: { user_id: qr.user_id } });

  res.json({
    success: true,
    data: {
      name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
      dateOfBirth: profile?.date_of_birth,
      gender: profile?.gender,
      bloodGroup: qr.blood_group,
      allergies: qr.allergies,
      conditions: qr.conditions,
      emergencyContact: qr.emergency_contact,
      pastSurgeries: qr.past_surgeries,
      currentMedications: qr.current_medications,
      notes: qr.notes,
    },
  });
}

async function addAllergy(req, res) {
  const userId = req.userId;
  const { allergyId, customAllergy, severity, reaction, notes } = req.body;
  const ua = await UserAllergy.create({
    user_id: userId,
    allergy_id: allergyId || null,
    custom_allergy: customAllergy || null,
    severity: severity || 'moderate',
    reaction, notes,
  });
  res.status(201).json({ success: true, data: ua });
}

async function removeAllergy(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  await UserAllergy.destroy({ where: { id, user_id: userId } });
  res.json({ success: true, message: 'Allergy removed' });
}

async function addCondition(req, res) {
  const userId = req.userId;
  const { conditionId, customCondition, diagnosedDate, notes } = req.body;
  const uc = await UserCondition.create({
    user_id: userId,
    condition_id: conditionId || null,
    custom_condition: customCondition || null,
    diagnosed_date: diagnosedDate || null,
    is_active: true,
    notes,
  });
  res.status(201).json({ success: true, data: uc });
}

async function removeCondition(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  await UserCondition.destroy({ where: { id, user_id: userId } });
  res.json({ success: true, message: 'Condition removed' });
}

module.exports = {
  createProfile, getProfile, updateProfile, getEmergencyData,
  addAllergy, removeAllergy, addCondition, removeCondition,
};
