const { generateWithRetry, API_KEYS, MODEL_PRIORITY } = require('../config/gemini');
const pdfParse = require('pdf-parse');
const fs = require('fs');

const VALID_URGENCY = ['routine', 'soon', 'urgent', 'emergency'];
const safeUrgency = v => VALID_URGENCY.includes(v) ? v : 'routine';

function extractJSON(text) {
  if (!text) return null;
  try {
    const clean = text.replace(/^```json\s*/im,'').replace(/^```\s*/im,'').replace(/```\s*$/im,'').trim();
    const m = clean.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch { return null; }
}

// ─── INTENT DETECTION (no AI call — keyword based, fast & free) ───────────────
function detectIntent(message) {
  const msg = message.toLowerCase().trim();

  // Booking intent
  if (/\b(book|schedule|make|set up|arrange|reserve)\b.*\b(appointment|slot|visit|consult|meeting)\b/i.test(msg) ||
      /\b(appointment|slot)\b.*\b(with|for|dr\.?|doctor)\b/i.test(msg) ||
      /\bbook\b.*\b(dr\.?|doctor)\b/i.test(msg)) {
    return 'BOOK_APPOINTMENT';
  }

  // List reports
  if (/\b(show|list|get|view|see|check)\b.*\b(my |all )?(reports?|results?|documents?|files?|records?|labs?|tests?)\b/i.test(msg) ||
      /\bwhat.*reports?\b/i.test(msg) ||
      /\bmy (reports?|results?|labs?)\b/i.test(msg)) {
    return 'LIST_REPORTS';
  }

  // View specific report content
  if (/\b(explain|describe|tell me about|what does|what is in|summarize|read)\b.*\b(report|result|document|lab|test)\b/i.test(msg) ||
      /\b(report|result|document)\b.*\b(explain|mean|say|show|read)\b/i.test(msg)) {
    return 'GET_REPORT';
  }

  // List appointments
  if (/\b(show|list|check|see|view|what are)\b.*\b(my )?(appointments?|bookings?|schedule)\b/i.test(msg) ||
      /\bupcoming appointments?\b/i.test(msg) ||
      /\bdo i have.*appointment\b/i.test(msg)) {
    return 'LIST_APPOINTMENTS';
  }

  // List doctors
  if (/\b(show|list|find|get|who are)\b.*\b(doctors?|physicians?|specialists?)\b/i.test(msg) ||
      /\bavailable doctors?\b/i.test(msg)) {
    return 'LIST_DOCTORS';
  }

  return 'CHAT';
}

// Extract doctor name from booking message
function extractDoctorName(message) {
  const patterns = [
    /\bwith\s+dr\.?\s+([a-z]+(?:\s+[a-z]+)?)/i,
    /\bdr\.?\s+([a-z]+(?:\s+[a-z]+)?)\b/i,
    /\bdoctor\s+([a-z]+(?:\s+[a-z]+)?)\b/i,
    /\bbook\s+([a-z]+(?:\s+[a-z]+)?)\b/i,
  ];
  for (const p of patterns) {
    const m = message.match(p);
    if (m) return m[1].trim().toLowerCase();
  }
  return null;
}

// Extract specialty from message
function extractSpecialty(message) {
  const specialties = [
    'cardiolog', 'neurolog', 'orthoped', 'pediatr', 'dermatolog',
    'gastroenterolog', 'pulmonolog', 'endocrinolog', 'psychiatr',
    'ophthalmolog', 'general', 'gynecolog', 'urolog', 'oncolog',
  ];
  const msg = message.toLowerCase();
  return specialties.find(s => msg.includes(s)) || null;
}

class AIService {

  // ── PDF ANALYSIS ──────────────────────────────────────────────────────────
  async analyzePDF(filePath, patientContext) {
    let rawText = '';
    try {
      rawText = (await pdfParse(fs.readFileSync(filePath))).text || '';
    } catch (err) {
      console.error('[AI] PDF read error:', err.message);
    }

    if (!API_KEYS.length) {
      return this._fallbackAnalysis(rawText, 'No Gemini API key configured. Add GEMINI_API_KEY_1 to backend/.env');
    }
    if (!rawText.trim()) {
      return this._fallbackAnalysis(rawText, 'Could not extract text from this PDF. It may be a scanned image — try uploading a text-based PDF.');
    }

    // Keep under 3000 chars to avoid rate limits on free tier
    const docText = rawText.substring(0, 3000);

    const prompt = `You are a medical AI assistant. Analyze this medical document for the patient.
Patient: Age ${patientContext.age||'?'}, ${patientContext.gender||'unknown'}, Blood type: ${patientContext.bloodGroup||'?'}
Known conditions: ${patientContext.conditions?.join(', ')||'none'}

Document content:
${docText}

Reply with ONLY valid JSON (absolutely no markdown, no backticks, no extra text):
{"summary":"2-3 sentences plain English","keyFindings":["finding 1","finding 2"],"whatItMeans":"what this means for the patient","actionItems":["next step"],"aiInsight":"personalized insight","recommendedSpecialty":"specialist type","urgencyLevel":"routine","indicators":[{"name":"test","value":"result","status":"normal"}],"confidenceScore":0.82,"disclaimer":"Always consult your doctor for proper medical advice."}`;

    try {
      const text = await generateWithRetry(prompt, { maxRetries: 3, delayMs: 3000 });

      if (!text) {
        return this._fallbackAnalysis(rawText, 'AI service is busy right now. Please try re-uploading the document in a few minutes.');
      }

      // Clean and parse JSON
      const clean = text.replace(/^```json\s*/im,'').replace(/^```\s*/im,'').replace(/```\s*$/im,'').trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          parsed.urgencyLevel = safeUrgency(parsed.urgencyLevel);
          return { rawText, analysis: parsed };
        } catch { /* fall through to text summary */ }
      }

      // Gemini responded but not valid JSON — use as summary
      return {
        rawText,
        analysis: {
          summary: text.substring(0, 500),
          keyFindings: [],
          confidenceScore: 0.5,
          urgencyLevel: 'routine',
          disclaimer: 'Always consult your doctor for proper medical advice.',
        },
      };
    } catch (err) {
      console.error('[AI] PDF analysis error:', err.message);
      return this._fallbackAnalysis(rawText, 'AI analysis failed. Please try re-uploading the document.');
    }
  }


  // ── SYMPTOM ANALYSIS ──────────────────────────────────────────────────────
  async analyzeSymptoms(symptoms, ctx) {
    if (!API_KEYS.length) return this._fallbackSymptomAnalysis(symptoms);
    const prompt = `Medical triage. Patient: Age ${ctx.age||'?'} ${ctx.gender||''}. Conditions: ${ctx.conditions?.join(',')||'none'}. Symptoms: ${symptoms}
JSON only: {"possibleConditions":[{"name":"x","probability":"high","description":"brief"}],"confidenceScore":0.7,"urgencyLevel":"routine","immediateActions":["action"],"recommendedSpecialty":"General Practice","indicators":[{"name":"item","detected":true,"significance":"meaning"}],"generalAdvice":"advice","redFlags":[],"disclaimer":"Not a diagnosis."}`;
    try {
      const text = await generateWithRetry(prompt, { maxRetries: 2, delayMs: 2000 });
      if (!text) return this._fallbackSymptomAnalysis(symptoms);
      const p = extractJSON(text);
      if (p) { p.urgencyLevel = safeUrgency(p.urgencyLevel); return p; }
      return this._fallbackSymptomAnalysis(symptoms);
    } catch (err) {
      console.error('[AI] Symptoms:', err.message);
      return this._fallbackSymptomAnalysis(symptoms);
    }
  }

  // ── CHAT  ─────────────────────────────────────────────────────────────────
  // Short, focused prompt. No doctor/document lists embedded.
  // Intent detection and actions happen BEFORE calling AI.
  async generateReply(message, patientContext, chatHistory, actionResult) {
    if (!API_KEYS.length) {
      return { reply: '⚠️ Add GEMINI_API_KEY_1 to backend/.env and restart.', urgencyLevel: 'routine', confidenceScore: 0, detectedSymptoms: [], indicators: [] };
    }

    const history = (chatHistory || []).slice(-4)
      .map(m => `${m.role === 'user' ? 'Patient' : 'AI'}: ${m.content.substring(0, 200)}`)
      .join('\n');

    // If action was taken — return empty string so controller uses actionResult.message directly
    // No AI call needed, saves rate limit quota
    if (actionResult) {
      return { reply: '', urgencyLevel: 'routine', confidenceScore: 0.9, detectedSymptoms: [], indicators: [] };
    }

    // Normal health conversation - short focused prompt
    const prompt = `You are MediAI, an empathetic AI medical assistant.
Patient: ${patientContext.name||'Patient'}, Age ${patientContext.age||'?'}, Blood: ${patientContext.bloodGroup||'?'}
Conditions: ${patientContext.conditions?.join(',')||'none'} | Allergies: ${patientContext.allergies?.join(',')||'none'}
${history ? `\nConversation:\n${history}` : ''}
Patient: "${message}"

Reply helpfully in under 150 words. Be warm, clear, non-alarming. Recommend seeing a doctor for diagnosis.
End with JSON: {"urgencyLevel":"routine","confidenceScore":0.8,"detectedSymptoms":["symptom if any"],"recommendedSpecialty":null}`;

    try {
      const raw = await generateWithRetry(prompt, { maxRetries: 3, delayMs: 2000 });
      if (!raw) return { reply: "I'm having trouble connecting. Please try again in a moment.", urgencyLevel: 'routine', confidenceScore: 0, detectedSymptoms: [], indicators: [] };

      // Extract JSON from end of response
      let reply = raw.trim();
      let meta = { urgencyLevel: 'routine', confidenceScore: 0.7, detectedSymptoms: [], indicators: [], recommendedSpecialty: null };

      const jsonMatch = raw.match(/\{[^{}]*"urgencyLevel"[^{}]*\}/);
      if (jsonMatch) {
        try {
          const p = JSON.parse(jsonMatch[0]);
          p.urgencyLevel = safeUrgency(p.urgencyLevel);
          meta = { ...meta, ...p };
          reply = raw.replace(jsonMatch[0], '').trim().replace(/\n+$/, '');
        } catch { /* use defaults */ }
      }

      return { reply, ...meta };
    } catch (err) {
      console.error('[AI] Chat error:', err.message);
      const msg = err.message || '';
      let reply = "I'm having trouble right now. Please try again in a moment.";
      if (msg.includes('401') || msg.includes('API key')) reply = '⚠️ Invalid API key. Check GEMINI_API_KEY_1 in .env';
      else if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) reply = '⚠️ Rate limit reached. Please wait 60 seconds and try again. Tip: add more Gemini API keys (GEMINI_API_KEY_2, etc.) to increase the limit.';
      return { reply, urgencyLevel: 'routine', confidenceScore: 0, detectedSymptoms: [], indicators: [] };
    }
  }

  // ── HEALTH CHECK ──────────────────────────────────────────────────────────
  async healthCheck() {
    if (!API_KEYS.length) return { status: 'no_key', message: 'No Gemini API key. Add GEMINI_API_KEY_1 to .env', keysLoaded: 0 };
    const { getClient } = require('../config/gemini');
    for (const m of MODEL_PRIORITY) {
      try {
        await getClient().getGenerativeModel({ model: m }).generateContent('OK?');
        return { status: 'ok', message: `Connected. Model: ${m}. Keys: ${API_KEYS.length}`, keysLoaded: API_KEYS.length };
      } catch (err) {
        const msg = err.message || '';
        if (msg.includes('429') || msg.includes('quota')) return { status: 'ok', message: `Key valid, rate limited. Keys: ${API_KEYS.length}`, keysLoaded: API_KEYS.length };
        if (msg.includes('401')) return { status: 'invalid_key', message: 'Invalid API key. Get one at aistudio.google.com', keysLoaded: API_KEYS.length };
      }
    }
    return { status: 'error', message: 'All models failed. Check API key at aistudio.google.com', keysLoaded: API_KEYS.length };
  }

  // ── DOCTOR RECOMMENDATIONS (rule-based, no API call) ─────────────────────
  async getRecommendedDoctors(patientContext, doctors) {
    if (!doctors.length) return [];
    const conds = (patientContext.conditions || []).map(c => c.toLowerCase());
    const recent = (patientContext.recentAnalyses || '').toLowerCase();
    const map = {
      cardiology: ['heart','cardiac','chest pain','hypertension','blood pressure'],
      neurology: ['headache','migraine','seizure','stroke','brain','epilepsy','dizzy'],
      orthopedics: ['joint','bone','knee','hip','spine','back pain','fracture'],
      pediatrics: ['child','baby','infant'],
      dermatology: ['skin','rash','acne','eczema','psoriasis'],
      gastroenterology: ['stomach','bowel','ibs','gerd','liver','nausea'],
      pulmonology: ['lung','asthma','copd','cough','breathing'],
      endocrinology: ['diabetes','thyroid','hormone'],
      psychiatry: ['anxiety','depression','mental','stress','sleep'],
    };
    return doctors
      .map(d => {
        const spec = (d.specialization || '').toLowerCase();
        let score = (d.rating || 0) * 2;
        for (const [s, kw] of Object.entries(map)) {
          if (spec.includes(s)) score += kw.filter(k => conds.some(c => c.includes(k)) || recent.includes(k)).length * 10;
        }
        score += Math.min(d.experience_years || 0, 20) * 0.5;
        return { ...d, _score: score };
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, 5)
      .map(({ _score, ...d }) => d);
  }

  _fallbackAnalysis(rawText, reason) {
    const msg = reason || 'AI analysis could not be completed at this time. The service may be busy. Please try re-uploading the document in a few minutes.';
    return { rawText: rawText||'', analysis: { summary: msg, keyFindings: [], confidenceScore: 0, urgencyLevel: 'routine', disclaimer: 'Please consult your doctor for proper medical advice.' } };
  }

  _fallbackSymptomAnalysis() {
    return { possibleConditions: [], confidenceScore: 0, urgencyLevel: 'routine', immediateActions: ['Please consult a healthcare professional'], recommendedSpecialty: 'General Practice', indicators: [], generalAdvice: 'AI unavailable. Please visit a doctor.', disclaimer: 'AI unavailable.' };
  }

  // Export helpers for use in controller
  get detectIntent() { return detectIntent; }
  get extractDoctorName() { return extractDoctorName; }
  get extractSpecialty() { return extractSpecialty; }
}

module.exports = new AIService();
