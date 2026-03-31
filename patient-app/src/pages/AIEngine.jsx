import { useState, useEffect, useRef } from 'react';
import { ai as aiAPI } from '../services/api';
import { Link } from 'react-router-dom';

const URGENCY_COLOR = { routine: '#10b981', soon: '#f59e0b', urgent: '#ef4444', emergency: '#7f1d1d' };

const QUICK_PROMPTS = [
  '📋 Show my recent reports',
  '📅 Show my upcoming appointments',
  '👨‍⚕️ List available doctors',
  'I have chest pain and shortness of breath',
  'I have a headache and fever for 2 days',
  'Book me an appointment with a cardiologist',
];

function renderText(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={i}>
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : <span key={j}>{p}</span>)}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    );
  });
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';

  // Special card for successful actions
  if (!isUser && msg.isAction) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ width: 32, height: 32, background: '#10b981', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>✅</div>
        <div style={{
          maxWidth: '88%', padding: '12px 16px',
          borderRadius: '4px 18px 18px 18px',
          background: '#f0fdf4', border: '1.5px solid #bbf7d0',
          fontSize: 14, lineHeight: 1.7, color: '#065f46',
          boxShadow: '0 1px 4px rgba(0,0,0,.08)',
        }}>
          {renderText(msg.content)}
        </div>
      </div>
    );
  }

  // Error action card
  if (!isUser && msg.isError) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ width: 32, height: 32, background: '#ef4444', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>❌</div>
        <div style={{
          maxWidth: '88%', padding: '12px 16px',
          borderRadius: '4px 18px 18px 18px',
          background: '#fef2f2', border: '1.5px solid #fecaca',
          fontSize: 14, lineHeight: 1.7, color: '#991b1b',
          boxShadow: '0 1px 4px rgba(0,0,0,.08)',
        }}>
          {renderText(msg.content)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, background: '#4f46e5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>🤖</div>
      )}
      <div style={{
        maxWidth: '82%', padding: '10px 14px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? '#4f46e5' : '#fff',
        color: isUser ? '#fff' : '#0f172a',
        fontSize: 14, lineHeight: 1.6,
        boxShadow: '0 1px 4px rgba(0,0,0,.08)',
      }}>
        {renderText(msg.content)}
      </div>
      {isUser && (
        <div style={{ width: 32, height: 32, background: '#e2e8f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>👤</div>
      )}
    </div>
  );
}

export default function AIEngine() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => {
    // Persist session across tab switches — stored per-day so history resets each day
    const storageKey = 'mediAI_sessionId_' + new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(storageKey);
    if (stored) return stored;
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); });
    localStorage.setItem(storageKey, newId);
    return newId;
  });
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('checking');
  const [metadata, setMetadata] = useState(null);
  const messagesEndRef = useRef(null);
  const [toast, setToast] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    checkHealth();
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const { data } = await aiAPI.getSessionHistory(sessionId);
      if (data.success && data.data?.length > 0) {
        const restored = data.data.map(m => ({
          role: m.role,
          content: m.content,
          isAction: m.metadata?.actionSuccess === true,
          isError: m.metadata?.actionSuccess === false,
        }));
        setMessages(restored);
      }
    } catch { /* no history yet */ }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function checkHealth() {
    try {
      const { data } = await aiAPI.health();
      setAiStatus(data.success ? 'ok' : (data.data?.status || 'error'));
      setMessages([{
        role: 'assistant',
        content: data.success
          ? `Hello! I'm **MediAI**, your intelligent health assistant. 🏥\n\nI can help you:\n• Analyze your symptoms\n• **Book doctor appointments**\n• **View and explain your reports**\n• Answer health questions\n\nWhat can I help you with today?`
          : `⚠️ ${data.data?.message || 'AI service unavailable'}\n\nTo fix: Add your Gemini API key to backend/.env → GEMINI_API_KEY_1=your_key`,
      }]);
    } catch {
      setAiStatus('ok');
      setMessages([{ role: 'assistant', content: `Hello! I'm MediAI. How can I help you today? 🏥\n\nI can book appointments, show your reports, and analyze symptoms.` }]);
    }
  }

  async function sendMessage(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const { data } = await aiAPI.chat({ message: msg, sessionId });
      const reply    = data.data?.reply || 'No response.';
      const meta     = data.data?.metadata || {};
      const action   = meta.actionResult;
      const intent   = meta.intent || 'CHAT';

      // Show booking toast notification
      if (action?.success && intent === 'BOOK_APPOINTMENT') {
        setToast({ msg: '✅ Appointment booked successfully!', type: 'success' });
        setTimeout(() => setToast(null), 5000);
      }

      setMessages(m => [...m, {
        role: 'assistant',
        content: reply,
        isAction: !!action?.success,
        isError: !!(action && !action.success),
        intent,
      }]);

      setMetadata(meta);
      setAiStatus('ok');
    } catch (err) {
      const msg2 = err.response?.data?.message || 'Connection error. Please try again.';
      setMessages(m => [...m, { role: 'assistant', content: `⚠️ ${msg2}`, isError: true }]);
      if (err.response?.status === 503) setAiStatus('no_key');
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  const statusInfo = {
    checking: { color: '#f59e0b', dot: '#f59e0b', text: 'Connecting…' },
    ok:       { color: '#10b981', dot: '#10b981', text: 'Online' },
    no_key:   { color: '#ef4444', dot: '#ef4444', text: 'No API Key' },
    error:    { color: '#ef4444', dot: '#ef4444', text: 'Error' },
  }[aiStatus] || { color: '#94a3b8', dot: '#94a3b8', text: 'Unknown' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc' }}>

      {/* Booking notification toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '12px 24px', borderRadius: 12, zIndex: 9999,
          fontWeight: 700, fontSize: 15, boxShadow: '0 8px 24px rgba(0,0,0,.2)',
          whiteSpace: 'nowrap', animation: 'slideDown .3s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', padding: '16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,.18)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🤖</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>MediAI Engine</h1>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Book appointments · View reports · Health guidance</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.15)', padding: '5px 12px', borderRadius: 20 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusInfo.dot, boxShadow: `0 0 6px ${statusInfo.dot}` }} />
            <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{statusInfo.text}</span>
          </div>
        </div>
      </div>

      {/* No API Key banner */}
      {aiStatus === 'no_key' && (
        <div style={{ background: '#fef3c7', borderBottom: '1px solid #fcd34d', padding: '10px 14px', fontSize: 13 }}>
          <strong style={{ color: '#92400e' }}>⚠️ Gemini API key not set.</strong>
          <span style={{ color: '#78350f' }}> Edit backend/.env → add GEMINI_API_KEY_1=your_key → restart server. Get free key at </span>
          <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" style={{ color: '#d97706', fontWeight: 600 }}>aistudio.google.com</a>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: metadata ? 240 : 80 }}>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Try asking</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p)}
                  style={{ padding: '9px 12px', background: '#fff', borderRadius: 10, border: '1.5px solid #e2e8f0', textAlign: 'left', fontSize: 12, color: '#334155', cursor: 'pointer', lineHeight: 1.4 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#a5b4fc'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: '#4f46e5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🤖</div>
            <div style={{ background: '#fff', padding: '10px 16px', borderRadius: '18px 18px 18px 4px', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i2 => (
                  <div key={i2} style={{ width: 7, height: 7, background: '#a5b4fc', borderRadius: '50%', animation: `bounce 0.6s ease ${i2 * 0.15}s infinite alternate` }} />
                ))}
                <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>MediAI is thinking…</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Analysis Panel */}
      {metadata && (metadata.confidenceScore || metadata.detectedSymptoms?.length > 0 || metadata.indicators?.length > 0) && (
        <div style={{ position: 'fixed', bottom: 76, left: 0, right: 0, background: '#fff', borderTop: '2px solid #e2e8f0', maxHeight: '38vh', overflowY: 'auto', zIndex: 50 }}>
          <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Confidence + Urgency */}
            <div style={{ display: 'flex', gap: 8 }}>
              {metadata.confidenceScore != null && (
                <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Confidence</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#4f46e5' }}>{Math.round(metadata.confidenceScore * 100)}%</p>
                </div>
              )}
              <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Urgency</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: URGENCY_COLOR[metadata.urgencyLevel] || '#94a3b8', textTransform: 'capitalize' }}>{metadata.urgencyLevel || 'Routine'}</p>
              </div>
              {metadata.recommendedSpecialty && (
                <div style={{ flex: 2, background: '#eff6ff', borderRadius: 10, padding: '8px' }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Recommended</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>{metadata.recommendedSpecialty}</p>
                </div>
              )}
            </div>

            {/* Symptoms */}
            {metadata.detectedSymptoms?.length > 0 && (
              <div>
                <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 5 }}>Noted Symptoms</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {metadata.detectedSymptoms.map((s, i) => (
                    <span key={i} style={{ padding: '3px 10px', background: '#fef3c7', color: '#92400e', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Indicators */}
            {metadata.detectedIndicators?.length > 0 && (
              <div>
                <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 5 }}>Indicators</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {metadata.detectedIndicators.slice(0, 4).map((ind, i) => (
                    <span key={i} style={{ padding: '3px 10px', background: '#eff6ff', color: '#1d4ed8', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{ind.name || ind}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Action shortcuts */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => sendMessage('Show my reports')} style={{ flex: 1, padding: '7px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 12, color: '#065f46', fontWeight: 600, cursor: 'pointer' }}>📋 My Reports</button>
              <button onClick={() => sendMessage('Show my appointments')} style={{ flex: 1, padding: '7px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 12, color: '#1d4ed8', fontWeight: 600, cursor: 'pointer' }}>📅 My Appointments</button>
              <Link to="/booking" style={{ flex: 1, padding: '7px', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, fontSize: 12, color: '#5b21b6', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>🏥 Book Now</Link>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); sendMessage(); }}
        style={{ position: 'fixed', bottom: 80, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e2e8f0', padding: '10px 12px 20px', display: 'flex', gap: 8, zIndex: 100 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder={aiStatus === 'no_key' ? 'Configure API key first…' : 'Ask about symptoms, book appointments, view reports…'}
          disabled={loading || aiStatus === 'no_key'}
          style={{ flex: 1, padding: '11px 16px', borderRadius: 24, border: '2px solid #e2e8f0', fontSize: 14, outline: 'none', transition: 'border-color .15s', background: aiStatus === 'no_key' ? '#f8fafc' : '#fff' }}
          onFocus={e => e.target.style.borderColor = '#a5b4fc'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
        <button type="submit"
          disabled={loading || !input.trim() || aiStatus === 'no_key'}
          style={{ width: 46, height: 46, borderRadius: 23, border: 'none', background: loading || !input.trim() ? '#e2e8f0' : '#4f46e5', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', transition: 'background .2s' }}>
          {loading ? '…' : '↑'}
        </button>
      </form>

      <style>{`
        @keyframes bounce { from { transform: translateY(0) } to { transform: translateY(-5px) } }
        @keyframes slideDown { from { transform: translateX(-50%) translateY(-20px); opacity: 0 } to { transform: translateX(-50%) translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}
