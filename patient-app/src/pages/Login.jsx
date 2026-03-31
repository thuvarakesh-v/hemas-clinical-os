import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('password'); // 'password' | 'pin'
  const [form, setForm] = useState({ identifier: '', password: '', pin: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(
        form.identifier,
        mode === 'password' ? form.password : undefined,
        mode === 'pin' ? form.pin : undefined
      );
      if (result.success) {
        // Always go to '/'. The router (ProfileRoute) will redirect to
        // /setup-profile automatically if profile isn't set up yet.
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1e40af 0%,#3b82f6 100%)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 25px 50px rgba(0,0,0,.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, background: '#eff6ff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 28 }}>🏥</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Welcome Back</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>MediCare AI Patient Portal</p>
        </div>

        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {['password', 'pin'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '8px', borderRadius: 8, fontWeight: 600, fontSize: 13, background: mode === m ? '#fff' : 'transparent', color: mode === m ? '#2563eb' : '#64748b', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.1)' : 'none', transition: 'all .2s' }}>
              {m === 'password' ? '🔑 Password' : '🔢 PIN'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group">
            <label>Email or Phone</label>
            <input className="input" value={form.identifier} onChange={set('identifier')} placeholder="email@example.com or +94771234567" required />
          </div>
          {mode === 'password' ? (
            <div className="input-group">
              <label>Password</label>
              <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
            </div>
          ) : (
            <div className="input-group">
              <label>PIN (4–6 digits)</label>
              <input className="input" type="password" value={form.pin} onChange={set('pin')} placeholder="••••" maxLength={6} required />
            </div>
          )}
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
