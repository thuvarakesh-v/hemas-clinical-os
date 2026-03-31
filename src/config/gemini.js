const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter(Boolean);

if (API_KEYS.length === 0) {
  console.error('');
  console.error('❌ NO GEMINI API KEY — AI features disabled');
  console.error('❌ Add GEMINI_API_KEY_1=your_key to backend/.env');
  console.error('❌ Get free key: https://aistudio.google.com/app/apikey');
  console.error('');
} else {
  console.log(`✅ Gemini AI ready — ${API_KEYS.length} key(s) loaded`);
}

// Model priority - gemini-flash-lite-latest is confirmed working
const MODEL_PRIORITY = [
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-3-flash-preview',
  'gemini-1.5-flash-8b',
];

let keyIndex = 0;

function getClient() {
  if (API_KEYS.length === 0) return null;
  const key = API_KEYS[keyIndex % API_KEYS.length];
  keyIndex = (keyIndex + 1) % API_KEYS.length;
  return new GoogleGenerativeAI(key);
}

function getModel(modelName) {
  const client = getClient();
  if (!client) return null;
  return client.getGenerativeModel({ model: modelName || MODEL_PRIORITY[0] });
}

async function generateWithRetry(prompt, options = {}) {
  if (API_KEYS.length === 0) return null;
  const { maxRetries = 2, delayMs = 2000 } = options;

  for (const modelName of MODEL_PRIORITY) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const client = getClient();
        if (!client) return null;
        const model = client.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (modelName !== MODEL_PRIORITY[0] || attempt > 0) {
          console.log(`[AI] Success: model=${modelName} attempt=${attempt + 1}`);
        }
        return text;
      } catch (err) {
        const msg = (err.message || '').toLowerCase();
        if (msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted')) {
          console.warn(`[AI] Rate limit: model=${modelName} attempt=${attempt + 1}, waiting ${delayMs}ms`);
          if (attempt < maxRetries) { await new Promise(r => setTimeout(r, delayMs)); continue; }
          break;
        }
        if (msg.includes('404') || msg.includes('not found') || msg.includes('deprecated')) {
          console.warn(`[AI] Model ${modelName} not found, trying next`);
          break;
        }
        if (msg.includes('401') || msg.includes('api key') || msg.includes('api_key')) {
          console.error(`[AI] Auth error: ${err.message}`);
          throw err;
        }
        if (msg.includes('safety') || msg.includes('blocked')) throw err;
        console.warn(`[AI] Error attempt ${attempt + 1}: ${err.message.substring(0, 80)}`);
        if (attempt < maxRetries) await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  console.error('[AI] All models exhausted');
  return null;
}

module.exports = { getModel, getClient, generateWithRetry, API_KEYS, MODEL_PRIORITY };
