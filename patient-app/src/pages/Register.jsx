import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';

const ACCOUNT_TYPES = [
  { value: 'individual', label: 'Individual', icon: '👤', desc: 'Personal account for yourself' },
  { value: 'parent', label: 'Parent / Guardian', icon: '👨‍👩‍👧', desc: 'Manage your childrens health' },
  { value: 'child', label: 'Child', icon: '👶', desc: 'Account linked to a guardian' },
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=type, 2=credentials, 3=otp
  const [accountType, setAccountType] = useState('individual');
  const [form, setForm] = useState({ email: '', phone: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const [verifyMethod, setVerifyMethod] = useState('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      const { data } = await auth.register({
        email: form.email || undefined,
        phone: form.phone || undefined,
        password: form.password,
        accountType,
      });
      if (data.success) {
        // SKIP_OTP mode: backend returns tokens directly, skip OTP step
        if (data.data.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          navigate('/');
          return;
        }
        // Normal flow: go to OTP step
        setUserId(data.data.userId);
        setVerifyMethod(data.data.verificationMethod);
        setStep(3);
      } else setError(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await auth.verifyOTP({ userId, otp, type: verifyMethod });
      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        navigate('/');
      } else setError(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally { setLoading(false); }
  }

  async function resendOTP() {
    try {
      await auth.resendOTP({ userId });
      setError('');
      alert('OTP resent!');
    } catch { alert('Failed to resend OTP'); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e40af 0%,#3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 25px 50px rgba(0,0,0,.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🏥</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Create Account</h1>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ width: 28, height: 4, borderRadius: 4, background: s <= step ? '#2563eb' : '#e2e8f0', transition: 'background .3s' }} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div>
            <p style={{ fontWeight: 600, marginBottom: 16, color: '#334155' }}>I am registering as:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {ACCOUNT_TYPES.map(t => (
                <button key={t.value} onClick={() => setAccountType(t.value)} style={{ padding: 16, borderRadius: 12, border: `2px solid ${accountType === t.value ? '#2563eb' : '#e2e8f0'}`, background: accountType === t.value ? '#eff6ff' : '#fff', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all .2s' }}>
                  <span style={{ fontSize: 24 }}>{t.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 600, color: '#0f172a' }}>{t.label}</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {accountType === 'child' && (
              <div style={{ background: '#fef3c7', padding: 12, borderRadius: 8, fontSize: 13, color: '#92400e', marginBottom: 16 }}>
                ⚠️ Child accounts can use the same phone number as the parent/guardian for verification.
              </div>
            )}
            <button className="btn btn-primary btn-full btn-lg" onClick={() => setStep(2)}>Continue →</button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>
              {accountType === 'child' ? 'Use the guardian\'s contact for verification.' : 'Provide at least one contact method.'}
            </p>
            <div className="input-group">
              <label>Email Address</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" />
            </div>
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>— or —</div>
            <div className="input-group">
              <label>Phone Number</label>
              <input className="input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+94771234567" />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Min 8 characters" required />
            </div>
            <div className="input-group">
              <label>Confirm Password</label>
              <input className="input" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat password" required />
            </div>
            {error && <p className="error-text">{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                {loading ? 'Registering…' : 'Send OTP →'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📨</div>
              <p style={{ color: '#334155', fontSize: 14 }}>
                OTP sent to your {verifyMethod === 'email' ? 'email address' : 'phone number'}.
              </p>
            </div>
            <div className="input-group">
              <label>Enter OTP</label>
              <input className="input" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit code" maxLength={6} style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 700 }} required />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Continue →'}
            </button>
            <button type="button" className="btn btn-secondary btn-full" onClick={resendOTP}>Resend OTP</button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
