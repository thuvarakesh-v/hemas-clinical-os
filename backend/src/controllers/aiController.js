const { v4: uuidv4 } = require('uuid');
const { ChatMessage, AIAnalysis, Doctor, Department, Appointment, Document, MedicalProfile, sequelize } = require('../models');
const { Op } = require('sequelize');
const aiService = require('../services/aiService');
const { buildPatientContext } = require('./documentController');

function sanitizeUrgency(level) {
  return ['routine', 'soon', 'urgent', 'emergency'].includes(level) ? level : 'routine';
}

// ─── SLOT HELPERS ─────────────────────────────────────────────
function generateSlots(start, end, duration) {
  const slots = [];
  const [sh, sm] = (start || '09:00').split(':').map(Number);
  const [eh, em] = (end || '17:00').split(':').map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const dur = Math.max(parseInt(duration) || 30, 15);
  while (cur + dur <= endMin) {
    slots.push(`${String(Math.floor(cur/60)).padStart(2,'0')}:${String(cur%60).padStart(2,'0')}`);
    cur += dur;
  }
  return slots;
}

async function findNextAvailableSlot(doctor, preferredDate, preferredTime) {
  const today = new Date();
  const availDays = Array.isArray(doctor.available_days) ? doctor.available_days : [1,2,3,4,5];
  const allSlots = generateSlots(doctor.slot_start_time, doctor.slot_end_time, doctor.slot_duration_minutes);

  // Build list of dates to check (preferred first, then next 14 days)
  const datesToCheck = [];
  if (preferredDate) {
    datesToCheck.push(preferredDate);
  }
  for (let offset = 1; offset <= 14; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const dayOfWeek = d.getDay();
    if (!availDays.includes(dayOfWeek)) continue;
    const ds = d.toISOString().split('T')[0];
    if (!datesToCheck.includes(ds)) datesToCheck.push(ds);
  }

  for (const dateStr of datesToCheck) {
    // Check this date is not in the past and doctor works this day
    const dateObj = new Date(dateStr + 'T00:00:00');
    if (dateObj <= today && dateStr !== today.toISOString().split('T')[0]) continue;
    const dayOfWeek = dateObj.getDay();
    if (!availDays.includes(dayOfWeek)) continue;

    const slots = allSlots.length ? allSlots : generateSlots(doctor.slot_start_time, doctor.slot_end_time, doctor.slot_duration_minutes);
    if (!slots.length) continue;

    const booked = await Appointment.findAll({
      where: { doctor_id: doctor.id, scheduled_date: dateStr, status: { [Op.in]: ['pending', 'confirmed'] } },
      attributes: ['scheduled_time'],
    });
    const bookedSet = new Set(booked.map(a => a.scheduled_time));

    // If preferred time requested, try to find it or the closest slot
    if (preferredTime) {
      const [prefH, prefM] = preferredTime.split(':').map(Number);
      const prefMins = prefH * 60 + prefM;

      // Sort slots by distance from preferred time
      const sorted = [...slots]
        .filter(t => !bookedSet.has(t))
        .sort((a, b) => {
          const [ah, am] = a.split(':').map(Number);
          const [bh, bm] = b.split(':').map(Number);
          return Math.abs((ah*60+am) - prefMins) - Math.abs((bh*60+bm) - prefMins);
        });

      if (sorted.length > 0) {
        return { date: dateStr, time: sorted[0], requestedTime: preferredTime };
      }
    } else {
      const freeSlot = slots.find(t => !bookedSet.has(t));
      if (freeSlot) return { date: dateStr, time: freeSlot };
    }
  }
  return null;
}

// ─── INTENT DETECTION (zero API calls) ───────────────────────
function detectIntent(message) {
  const m = message.toLowerCase().trim();

  // BOOK APPOINTMENT - check first (most important)
  if (
    /\b(book|schedule|make|set up|arrange|reserve|get)\b.*\b(appointment|slot|visit|consult|meeting|session)\b/i.test(m) ||
    /\b(appointment|slot)\b.*\b(with|for|dr\.?|doctor)\b/i.test(m) ||
    /\bbook\b.*\b(dr\.?|doctor|cardiolog|neurolog|pediatr|dermatolog|general|specialist)\b/i.test(m) ||
    /\b(see|visit|meet)\b.*\b(a\s)?(doctor|dr\.?|physician|specialist)\b/i.test(m) ||
    /\bwant.*appointment\b/i.test(m) ||
    /\bneed.*doctor\b/i.test(m) ||
    /\bcan you book\b/i.test(m) ||
    /\bbook\s+a\s+(cardiolog|neurolog|pediatr|dermatolog|general|gynecolog|psychiatr|orthoped|urolog|oncolog|pulmon|endocrin|gastro|ophthalmol|ent)\b/i.test(m)
  ) return 'BOOK_APPOINTMENT';

  // LIST REPORTS
  if (
    /\b(show|list|get|view|see|check|do i have)\b.*\b(my\s+)?(reports?|results?|documents?|labs?|tests?|files?|records?)\b/i.test(m) ||
    /\bwhat.*reports?\b/i.test(m) ||
    /\bmy\s+(reports?|results?|documents?|labs?)\b/i.test(m) ||
    /\bhave.*upload\b/i.test(m)
  ) return 'LIST_REPORTS';

  // GET SPECIFIC REPORT
  if (
    /\b(explain|describe|tell me about|what does|what is in|summarize|read|open|analyze)\b.*\b(report|result|document|lab|test|pdf|cbc|blood|urine|xray|scan|mri)\b/i.test(m) ||
    /\b(report|result|document|cbc|blood test|lab test)\b.*\b(mean|say|show|tell|explain|contain|about)\b/i.test(m) ||
    /\bwhat does.*my.*\b(cbc|blood|result|test|report|lab)\b/i.test(m) ||
    /\bmy.*(cbc|blood test|lab result|test result|report)\b.*\b(mean|say|show)\b/i.test(m)
  ) return 'GET_REPORT';

  // LIST APPOINTMENTS
  if (
    /\b(show|list|check|see|view|what are|do i have)\b.*\b(my\s+)?(appointments?|bookings?|schedule)\b/i.test(m) ||
    /\bupcoming\s+appointment\b/i.test(m) ||
    /\b(any|check)\s+appointment\b/i.test(m)
  ) return 'LIST_APPOINTMENTS';

  // LIST DOCTORS
  if (
    /\b(show|list|find|get|who are|available)\b.*\b(doctors?|physicians?|specialists?)\b/i.test(m) ||
    /\bavailable\s+doctors?\b/i.test(m) ||
    /\bwhat\s+doctors?\b/i.test(m)
  ) return 'LIST_DOCTORS';

  return 'CHAT';
}

function extractDoctorName(message) {
  const stopWords = /^(for|about|to|on|next|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|at|the|a|an|please|appointment|slot|visit|consult)$/i;
  const patterns = [
    /with\s+dr\.?\s+([a-z][a-z\s]{1,30}?)(?:\s+(?:for|about|to|on|at|next|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|[,.]|$)/i,
    /book\s+(?:an?\s+)?appointment\s+with\s+(?:dr\.?\s+)?([a-z][a-z\s]{1,30}?)(?:\s+(?:for|about|to|on|at)|[,.]|$)/i,
    /see\s+dr\.?\s+([a-z][a-z\s]{1,20}?)(?:\s+(?:for|about|to|on|at)|[,.]|$)/i,
    /dr\.?\s+([a-z][a-z\s]{1,20}?)(?:'s|\s+is|\s+for|\s+about|\s+on|\s+at|[,.]|\s*$)/i,
    /doctor\s+([a-z][a-z\s]{1,20}?)(?:\s+for|\s+about|\s+on|\s+at|[,.]|\s*$)/i,
  ];
  for (const p of patterns) {
    const m = message.match(p);
    if (m && m[1]) {
      // Clean up the captured name: remove stop words from the end
      const parts = m[1].trim().split(/\s+/).filter(w => w.length > 1 && !stopWords.test(w));
      if (parts.length > 0) return parts.join(' ').toLowerCase();
    }
  }
  return null;
}

function extractRequestedTime(message) {
  // Normalise: "4.00pm" -> "4:00pm", "4.30" -> "4:30"
  const norm = message.replace(/(\d{1,2})\.(\d{2})\s*(am|pm)/gi, '$1:$2$3').replace(/(\d{1,2})\.(\d{2})/g, '$1:$2');

  // Patterns in order of specificity
  const patterns = [
    { re: /at\s+(\d{1,2}):(\d{2})\s*(am|pm)/i,  hour: 1, min: 2, mer: 3 },
    { re: /at\s+(\d{1,2})\s*(am|pm)/i,           hour: 1, min: 0, mer: 2 },
    { re: /at\s+(\d{1,2}):(\d{2})/,            hour: 1, min: 2, mer: 0 },
    { re: /(\d{1,2}):(\d{2})\s*(am|pm)/i,        hour: 1, min: 2, mer: 3 },
    { re: /(\d{1,2})\s*(am|pm)/i,              hour: 1, min: 0, mer: 2 },
    { re: /(\d{1,2}):(\d{2})/,                 hour: 1, min: 2, mer: 0 },
    { re: /\b(\d{1,2})\s*o'?clock\b/i,              hour: 1, min: 0, mer: 0 },
    { re: /\bat\s+(\d{1,2})\b(?![:\d])/,             hour: 1, min: 0, mer: 0 },
  ];

  for (const { re, hour: hi, min: mi, mer: meri } of patterns) {
    const m = norm.match(re);
    if (!m) continue;

    let hour = parseInt(m[hi]);
    const min = mi > 0 ? parseInt(m[mi] || '0') : 0;
    const meridiem = meri > 0 ? (m[meri] || '').toLowerCase() : '';

    if (isNaN(hour)) continue;

    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    // If no am/pm given and hour <= 8, assume pm (clinic context: "at 4" = 4pm)
    if (!meridiem && hour >= 1 && hour <= 8) hour += 12;

    if (hour >= 7 && hour <= 21) {
      return String(hour).padStart(2,'0') + ':' + String(min).padStart(2,'0');
    }
  }
  return null;
}

function extractRequestedDate(message) {
  const m = message.toLowerCase();
  const today = new Date();

  if (m.includes('tomorrow')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  if (m.includes('day after tomorrow') || m.includes('day after tomm')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }

  // Day names: "on monday", "this friday"
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  for (let i = 0; i < days.length; i++) {
    if (m.includes(days[i])) {
      const d = new Date(today);
      const diff = (i - today.getDay() + 7) % 7 || 7; // next occurrence
      d.setDate(d.getDate() + diff);
      return d.toISOString().split('T')[0];
    }
  }

  // Specific dates like "April 5", "5th April"
  const dateMatch = m.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i) ||
    m.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i);
  if (dateMatch) {
    try {
      const parsed = new Date(dateMatch[0] + ' ' + today.getFullYear());
      if (!isNaN(parsed)) return parsed.toISOString().split('T')[0];
    } catch { /* ignore */ }
  }

  return null;
}

function extractSpecialty(message) {
  const map = [
    ['cardiology', ['cardiolog', 'heart', 'cardiac']],
    ['neurology', ['neurolog', 'brain', 'headache', 'migraine', 'seizure', 'stroke']],
    ['orthopedics', ['orthoped', 'bone', 'joint', 'knee', 'hip', 'spine', 'back']],
    ['pediatrics', ['pediatr', 'child', 'baby', 'infant', 'kid']],
    ['dermatology', ['dermatolog', 'skin', 'rash', 'acne']],
    ['gastroenterology', ['gastro', 'stomach', 'bowel', 'ibs', 'digestive']],
    ['pulmonology', ['pulmon', 'lung', 'asthma', 'breathing', 'respiratory']],
    ['endocrinology', ['endocrin', 'diabetes', 'thyroid', 'hormone']],
    ['psychiatry', ['psychiatr', 'mental', 'anxiety', 'depression', 'stress']],
    ['general practice', ['general', 'gp', 'family doctor', 'primary']],
    ['gynecology', ['gynecol', 'womens', 'obgyn']],
    ['ophthalmology', ['ophthalmol', 'eye', 'vision']],
    ['ent', ['ent', 'ear', 'nose', 'throat']],
  ];
  const m = message.toLowerCase();
  for (const [specialty, keywords] of map) {
    if (keywords.some(k => m.includes(k))) return specialty;
  }
  return null;
}

// ─── ACTION EXECUTOR (no AI calls) ────────────────────────────
async function executeAction(intent, message, userId) {
  console.log(`[Agent] intent=${intent} userId=${userId} msg="${message.substring(0,50)}"`);

  switch (intent) {

    case 'LIST_REPORTS': {
      const docs = await Document.findAll({
        where: { patient_id: userId, is_visible_to_patient: true },
        order: [['document_date', 'DESC']],
        limit: 10,
      });
      if (!docs.length) {
        return { success: true, message: '📂 **No reports found.**\n\nYou have no uploaded reports yet. Go to **Health Vault** (bottom menu) to upload your medical documents.', data: [] };
      }
      const list = docs.map((d, i) =>
        `${i+1}. **${d.title || d.original_name}** — ${d.document_date || 'No date'} | ${d.category.replace(/_/g,' ')}${d.is_ai_analyzed ? ' ✓ AI' : ' ⏳'}`
      ).join('\n');
      return { success: true, message: `📂 **Your Reports (${docs.length} total):**\n\n${list}\n\nAsk me to explain any report, e.g. *"explain my blood test"*`, data: docs };
    }

    case 'GET_REPORT': {
      const msgLower = message.toLowerCase();
      const docs = await Document.findAll({
        where: { patient_id: userId, is_visible_to_patient: true },
        order: [['document_date', 'DESC']],
        limit: 20,
      });
      if (!docs.length) return { success: true, message: '📂 No reports uploaded yet. Upload reports in the **Health Vault** section.', data: null };

      // Match by keywords in title/name
      let target = docs.find(d => {
        const t = (d.title || d.original_name || '').toLowerCase();
        return t.split(/[\s_\-\.]+/).some(w => w.length > 3 && msgLower.includes(w));
      }) || docs[0];

      const analysis = await AIAnalysis.findOne({
        where: { document_id: target.id },
        order: [['created_at', 'DESC']],
      });

      if (!analysis) {
        return { success: true, message: `📄 **${target.title || target.original_name}** (${target.document_date})\n\n⏳ AI analysis is still processing. Please wait a moment and ask again. If it keeps pending, try re-uploading the report.`, data: null };
      }

      const r = analysis.result || {};
      let msg = `📄 **Report: ${target.title || target.original_name}**\n📅 Date: ${target.document_date} | Category: ${target.category}\n\n`;
      if (r.summary) msg += `**📋 Summary:**\n${r.summary}\n\n`;
      if (r.keyFindings?.length) msg += `**🔍 Key Findings:**\n${r.keyFindings.map(f=>`• ${f}`).join('\n')}\n\n`;
      if (r.whatItMeans) msg += `**💡 What This Means:**\n${r.whatItMeans}\n\n`;
      if (r.aiInsight) msg += `**🤖 AI Insight:**\n${r.aiInsight}\n\n`;
      if (r.actionItems?.length) msg += `**✅ Recommended Next Steps:**\n${r.actionItems.map(a=>`• ${a}`).join('\n')}\n\n`;
      if (r.indicators?.length) {
        const abnormal = r.indicators.filter(i => i.status === 'abnormal' || i.status === 'borderline');
        if (abnormal.length) msg += `**⚠️ Flagged Indicators:**\n${abnormal.map(i=>`• ${i.name}: ${i.value || i.status}`).join('\n')}\n\n`;
      }
      msg += `_${r.disclaimer || 'Always consult your doctor for proper medical advice.'}_`;
      return { success: true, message: msg.trim(), data: analysis };
    }

    case 'LIST_APPOINTMENTS': {
      const today = new Date().toISOString().split('T')[0];
      const [upcoming, past] = await Promise.all([
        Appointment.findAll({
          where: { patient_id: userId, status: { [Op.in]: ['confirmed','pending'] }, scheduled_date: { [Op.gte]: today } },
          include: [{ model: Doctor, as: 'doctor', attributes: ['first_name','last_name','specialization'] }],
          order: [['scheduled_date','ASC'],['scheduled_time','ASC']],
          limit: 5,
        }),
        Appointment.findAll({
          where: { patient_id: userId, status: 'completed', scheduled_date: { [Op.lt]: today } },
          include: [{ model: Doctor, as: 'doctor', attributes: ['first_name','last_name','specialization'] }],
          order: [['scheduled_date','DESC']],
          limit: 3,
        }),
      ]);

      let msg = '';
      if (upcoming.length) {
        const list = upcoming.map((a,i) =>
          `${i+1}. 📅 **${a.scheduled_date}** at **${a.scheduled_time}**\n   👨‍⚕️ Dr. ${a.doctor?.first_name} ${a.doctor?.last_name} — ${a.doctor?.specialization}\n   Status: ${a.status}${a.reason ? `\n   Reason: ${a.reason}` : ''}`
        ).join('\n\n');
        msg += `📅 **Upcoming Appointments (${upcoming.length}):**\n\n${list}`;
      } else {
        msg += `📅 **No upcoming appointments.**\n\nWould you like me to book one? Just say *"book an appointment with [doctor/specialty]"*`;
      }
      if (past.length) {
        const plist = past.map(a => `• ${a.scheduled_date} — Dr. ${a.doctor?.first_name} ${a.doctor?.last_name} (${a.status})`).join('\n');
        msg += `\n\n**Recent Past:**\n${plist}`;
      }
      return { success: true, message: msg, data: { upcoming, past } };
    }

    case 'LIST_DOCTORS': {
      const specialty = extractSpecialty(message);
      const where = { is_active: true };
      if (specialty) where.specialization = { [Op.iLike]: `%${specialty}%` };

      const doctors = await Doctor.findAll({
        where,
        include: [{ model: Department, as: 'department', required: false }],
        order: [['rating','DESC'],['experience_years','DESC']],
        limit: 8,
      });

      if (!doctors.length) {
        return { success: true, message: `No doctors found${specialty ? ` for "${specialty}"` : ''}.\n\nTry: *"list doctors"* or *"book a general practitioner"*`, data: [] };
      }

      const list = doctors.map((d,i) =>
        `${i+1}. **Dr. ${d.first_name} ${d.last_name}** — ${d.specialization}\n   ⭐ ${d.rating} | ${d.experience_years}y experience | LKR ${d.consultation_fee}/visit`
      ).join('\n\n');

      return {
        success: true,
        message: `👨‍⚕️ **Available Doctors${specialty ? ` (${specialty})` : ''}:**\n\n${list}\n\n💬 Say *"book appointment with Dr. [name]"* to book!`,
        data: doctors.map(d => d.toSafeJSON()),
      };
    }

    case 'BOOK_APPOINTMENT': {
      const doctorName     = extractDoctorName(message);
      const specialty      = extractSpecialty(message);
      const preferredTime  = extractRequestedTime(message);
      const preferredDate  = extractRequestedDate(message);
      console.log(`[Booking] name="${doctorName}" specialty="${specialty}" time="${preferredTime}" date="${preferredDate}"`);

      // Load all active doctors
      const allDoctors = await Doctor.findAll({
        where: { is_active: true },
        order: [['rating','DESC']],
      });

      console.log(`[Booking] Found ${allDoctors.length} active doctors`);

      if (!allDoctors.length) {
        return { success: false, message: '❌ No doctors available in the system. Please use the Booking page to check.', data: null };
      }

      let matched = null;

      // 1. Match by name (most specific) — strict priority, no silent fallthrough
      if (doctorName) {
        const nameLower = doctorName.toLowerCase();
        const parts = nameLower.split(/\s+/).filter(p => p.length > 1);

        matched =
          // Exact full name
          allDoctors.find(d => `${d.first_name} ${d.last_name}`.toLowerCase() === nameLower) ||
          // Exact last name
          allDoctors.find(d => d.last_name.toLowerCase() === nameLower) ||
          // Exact first name
          allDoctors.find(d => d.first_name.toLowerCase() === nameLower) ||
          // All parts found in full name
          allDoctors.find(d => {
            const full = `${d.first_name} ${d.last_name}`.toLowerCase();
            return parts.every(p => full.includes(p));
          }) ||
          // Any part is exact word in first or last name
          allDoctors.find(d => {
            const fn = d.first_name.toLowerCase();
            const ln = d.last_name.toLowerCase();
            return parts.some(p => fn === p || ln === p || ln.startsWith(p) || fn.startsWith(p));
          });

        console.log(`[Booking] Name match for "${doctorName}": ${matched ? matched.first_name + ' ' + matched.last_name : 'none'}`);

        // User named a specific doctor but we can't find them — do NOT fall through to a random doctor
        if (!matched) {
          return {
            success: false,
            message: `❌ No doctor found matching **"${doctorName}"**.\n\nPlease check the name and try again, or say *"list doctors"* to see all available doctors.`,
            data: null,
          };
        }
      }

      // 2. Match by specialty (only when no doctor name was given)
      if (!matched && specialty) {
        matched = allDoctors.find(d => d.specialization.toLowerCase().includes(specialty.toLowerCase().substring(0, 6)));
        console.log(`[Booking] Specialty match for "${specialty}": ${matched ? matched.first_name + ' ' + matched.last_name : 'none'}`);
      }

      // 3. Best rated general practitioner fallback (only when no name/specialty given)
      if (!matched) {
        matched = allDoctors.find(d =>
          d.specialization.toLowerCase().includes('general') ||
          d.specialization.toLowerCase().includes('practice')
        ) || allDoctors[0];
        console.log(`[Booking] Fallback to: ${matched?.first_name} ${matched?.last_name}`);
      }

      if (!matched) {
        return { success: false, message: '❌ Could not find a suitable doctor. Please use the **Booking** page to search manually.', data: null };
      }

      // Get full record
      const doctor = await Doctor.findByPk(matched.id);
      console.log(`[Booking] Trying to find slot for Dr. ${doctor.first_name} ${doctor.last_name}`);

      const slot = await findNextAvailableSlot(doctor, preferredDate, preferredTime);
      console.log(`[Booking] Next slot: ${slot ? slot.date + ' ' + slot.time : 'none'} (requested: ${preferredDate||'any'} ${preferredTime||'any'})`);

      if (!slot) {
        return {
          success: false,
          message: `❌ **Dr. ${doctor.first_name} ${doctor.last_name}** has no available slots in the next 14 days.\n\nTry asking for a different doctor or use the **Booking** page to choose a specific date.`,
          data: null,
        };
      }

      // Check for patient conflict
      const conflict = await Appointment.findOne({
        where: { patient_id: userId, scheduled_date: slot.date, scheduled_time: slot.time, status: { [Op.in]: ['pending','confirmed'] } },
      });
      if (conflict) {
        // Find next available slot skipping this time
        const allSlots = generateSlots(doctor.slot_start_time, doctor.slot_end_time, doctor.slot_duration_minutes);
        const bookedForDay = await Appointment.findAll({
          where: { doctor_id: doctor.id, scheduled_date: slot.date, status: { [Op.in]: ['pending','confirmed'] } },
          attributes: ['scheduled_time'],
        });
        const dayBooked = new Set(bookedForDay.map(a => a.scheduled_time));
        const altTime = allSlots.find(t => t !== slot.time && !dayBooked.has(t));
        if (altTime) slot.time = altTime;
        else {
          return { success: false, message: '❌ You already have an appointment at the next available time. Please use the **Booking** page to choose a specific slot.', data: null };
        }
      }

      // Extract reason
      const reasonMatch = message.match(/(?:for|about|regarding|because|reason:?)\s+(.{5,80})(?:\s*$|[,.])/i);
      const reason = reasonMatch ? reasonMatch[1].trim() : 'General consultation via MediAI';

      const appt = await Appointment.create({
        patient_id: userId,
        doctor_id: doctor.id,
        scheduled_date: slot.date,
        scheduled_time: slot.time,
        duration_minutes: doctor.slot_duration_minutes || 30,
        status: 'confirmed',
        reason,
      });

      await doctor.increment('patient_count');

      console.log(`[Booking] ✅ Appointment created: ${appt.id} with Dr. ${doctor.first_name} on ${slot.date} at ${slot.time}`);

      const timeNote = (preferredTime && slot.time !== preferredTime)
        ? `\n\u26a0\ufe0f Note: ${preferredTime} was not available \u2014 booked at nearest available slot`
        : '';
      return {
        success: true,
        message: `✅ **Appointment Booked Successfully!**\n\n👨‍⚕️ **Dr. ${doctor.first_name} ${doctor.last_name}**\n🏥 ${doctor.specialization}\n📅 **Date:** ${slot.date}\n⏰ **Time:** ${slot.time}\n💰 **Fee:** LKR ${doctor.consultation_fee}\n📋 **Reason:** ${reason}${timeNote}\n\n_Your appointment is confirmed! View it in the Appointments section._`,
        data: { appointmentId: appt.id, doctor: doctor.first_name + ' ' + doctor.last_name, date: slot.date, time: slot.time },
      };
    }

    default:
      return null;
  }
}

// ─── MAIN CHAT ────────────────────────────────────────────────
async function chat(req, res) {
  const userId = req.userId;
  const { message, sessionId } = req.body;
  if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message required' });

  const sid = sessionId || uuidv4();
  const trimmedMsg = message.trim();

  // Load history (last 10 messages)
  const history = await ChatMessage.findAll({
    where: { patient_id: userId, session_id: sid },
    order: [['created_at','ASC']],
    limit: 10,
  });

  // Patient context for AI
  const patientContext = await buildPatientContext(userId);

  // Detect intent (zero API calls)
  const intent = detectIntent(trimmedMsg);
  console.log(`[Chat] intent=${intent} user=${userId}`);

  // Save user message
  await ChatMessage.create({ patient_id: userId, session_id: sid, role: 'user', content: trimmedMsg });

  // Execute action if needed (zero API calls for actions)
  let actionResult = null;
  if (intent !== 'CHAT') {
    try {
      actionResult = await executeAction(intent, trimmedMsg, userId);
      console.log(`[Chat] action done: success=${actionResult?.success}`);
    } catch (err) {
      console.error('[Chat] Action error:', err.message);
      actionResult = {
        success: false,
        message: `❌ ${err.message}\n\nPlease try the Booking or Appointments page directly.`,
        data: null,
      };
    }
  }

  // Get AI reply (only for pure chat, OR brief ack for actions)
  const aiResponse = await aiService.generateReply(trimmedMsg, patientContext, history, actionResult);

  // Final reply: action message or AI chat response
  const finalReply = actionResult
    ? actionResult.message  // action message is the reply (no AI ack)
    : (aiResponse.reply || "I'm having trouble connecting. Please try again.");

  // Save assistant message
  await ChatMessage.create({
    patient_id: userId,
    session_id: sid,
    role: 'assistant',
    content: finalReply,
    metadata: { intent, urgencyLevel: aiResponse.urgencyLevel, actionSuccess: actionResult?.success },
  });

  // Store significant AI analyses
  if (!actionResult && (aiResponse.urgencyLevel !== 'routine' || (aiResponse.detectedSymptoms?.length || 0) > 0)) {
    await AIAnalysis.create({
      patient_id: userId,
      analysis_type: 'chat',
      input_data: { message: trimmedMsg, sessionId: sid },
      result: { reply: finalReply, ...aiResponse },
      confidence_score: aiResponse.confidenceScore || null,
      summary: `Chat: ${trimmedMsg.substring(0, 100)}`,
      recommended_specialty: aiResponse.recommendedSpecialty || null,
      urgency_level: sanitizeUrgency(aiResponse.urgencyLevel),
    });
  }

  res.json({
    success: true,
    data: {
      sessionId: sid,
      reply: finalReply,
      metadata: {
        intent,
        confidenceScore: aiResponse.confidenceScore || null,
        urgencyLevel: aiResponse.urgencyLevel || 'routine',
        detectedIndicators: aiResponse.indicators || [],
        recommendedSpecialty: aiResponse.recommendedSpecialty || null,
        detectedSymptoms: aiResponse.detectedSymptoms || [],
        actionResult: actionResult || null,
      },
    },
  });
}

// ─── REST OF HANDLERS ─────────────────────────────────────────
async function analyzeSymptoms(req, res) {
  const userId = req.userId;
  const { symptoms } = req.body;
  if (!symptoms) return res.status(400).json({ success: false, message: 'Symptoms required' });
  const ctx = await buildPatientContext(userId);
  const analysis = await aiService.analyzeSymptoms(symptoms, ctx);
  await AIAnalysis.create({
    patient_id: userId, analysis_type: 'symptom', input_data: { symptoms },
    result: analysis, confidence_score: analysis.confidenceScore || null,
    summary: `Symptoms: ${symptoms.substring(0, 100)}`,
    recommended_specialty: analysis.recommendedSpecialty || null,
    urgency_level: sanitizeUrgency(analysis.urgencyLevel),
  });
  res.json({ success: true, data: analysis });
}

async function getRecommendedDoctors(req, res) {
  const userId = req.userId;
  const { specialty, departmentId, search, limit = 10 } = req.query;
  const where = { is_active: true };
  if (departmentId) where.department_id = departmentId;
  if (specialty) where.specialization = { [Op.iLike]: `%${specialty}%` };
  if (search) {
    where[Op.or] = [
      { first_name: { [Op.iLike]: `%${search}%` } },
      { last_name: { [Op.iLike]: `%${search}%` } },
      { specialization: { [Op.iLike]: `%${search}%` } },
    ];
  }
  const doctors = await Doctor.findAll({
    where, include: [{ model: Department, as: 'department', required: false }],
    limit: parseInt(limit) * 2, order: [['rating','DESC'],['experience_years','DESC']],
  });
  const ctx = await buildPatientContext(userId);
  const ranked = await aiService.getRecommendedDoctors(ctx, doctors.map(d => ({ ...d.toSafeJSON(), department: d.department?.name })));
  res.json({ success: true, data: ranked.slice(0, parseInt(limit)) });
}

async function agentAction(req, res) {
  const userId = req.userId;
  const { intent, message } = req.body;
  if (!intent) return res.status(400).json({ success: false, message: 'intent required' });
  try {
    const result = await executeAction(intent, message || '', userId);
    res.json({ success: true, data: result });
  } catch (err) {
    res.json({ success: false, data: { message: `❌ ${err.message}` } });
  }
}

async function getChatHistory(req, res) {
  const messages = await ChatMessage.findAll({
    where: { patient_id: req.userId, session_id: req.params.sessionId },
    order: [['created_at','ASC']],
  });
  res.json({ success: true, data: messages });
}

async function getChatSessions(req, res) {
  const sessions = await ChatMessage.findAll({
    where: { patient_id: req.userId, role: 'user' },
    attributes: ['session_id', [sequelize.fn('MAX', sequelize.col('created_at')), 'last_message_at'], [sequelize.fn('COUNT', sequelize.col('id')), 'message_count']],
    group: ['session_id'],
    order: [[sequelize.fn('MAX', sequelize.col('created_at')), 'DESC']],
    limit: 20,
  });
  res.json({ success: true, data: sessions });
}

async function getPatientAnalyses(req, res) {
  const userId = req.params.patientId || req.userId;
  const { type, limit = 10 } = req.query;
  const where = { patient_id: userId };
  if (type) where.analysis_type = type;
  const analyses = await AIAnalysis.findAll({ where, order: [['created_at','DESC']], limit: parseInt(limit) });
  res.json({ success: true, data: analyses });
}

async function aiHealthCheck(req, res) {
  const result = await aiService.healthCheck();
  res.status(result.status === 'ok' ? 200 : 503).json({ success: result.status === 'ok', data: result });
}

module.exports = { chat, analyzeSymptoms, getRecommendedDoctors, getChatHistory, getChatSessions, getPatientAnalyses, aiHealthCheck, agentAction };

