import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patient as patientAPI } from '../services/api';

export default function Profile() {
  const { profile, logout, loadProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({
    heightCm: profile?.profile?.height_cm || '',
    weightKg: profile?.profile?.weight_kg || '',
    normalHeartRateMin: profile?.profile?.normal_heart_rate_min || 60,
    normalHeartRateMax: profile?.profile?.normal_heart_rate_max || 100,
    normalBpSystolic: profile?.profile?.normal_bp_systolic || 120,
    normalBpDiastolic: profile?.profile?.normal_bp_diastolic || 80,
    normalTemperature: profile?.profile?.normal_temperature || 37.0,
    normalOxygenSaturation: profile?.profile?.normal_oxygen_saturation || 98,
    emergencyContactName: profile?.profile?.emergency_contact_name || '',
    emergencyContactPhone: profile?.profile?.emergency_contact_phone || '',
    emergencyContactRelation: profile?.profile?.emergency_contact_relation || '',
  });

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function saveProfile() {
    setSaving(true);
    try {
      await patientAPI.updateProfile(form);
      await loadProfile();
      setEditing(false);
      showToast('✅ Profile updated successfully');
    } catch {
      showToast('❌ Update failed. Please try again.');
    } finally { setSaving(false); }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const p = profile?.profile;
  const u = profile?.user;
  const qr = profile?.emergencyQR;
  const allergies = profile?.allergies || [];
  const conditions = profile?.conditions || [];

  if (!p) {
    return (
      <div className="page-content">
        <div className="page-header"><h1>👤 Profile</h1></div>
        <div style={{ padding: '60px 16px', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p style={{ fontWeight: 600 }}>No profile set up yet</p>
          <Link to="/setup-profile" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
            Complete Setup →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: toast.startsWith('✅') ? '#10b981' : '#ef4444', color: '#fff', padding: '12px 20px', borderRadius: 10, zIndex: 9999, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1e40af,#3b82f6)', padding: '20px 16px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,.2)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>👤</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>{p.first_name} {p.last_name}</h1>
            <p style={{ opacity: 0.75, fontSize: 13, marginTop: 3 }}>{u?.email || u?.phone}</p>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)', color: '#fff', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[
            { label: 'Blood Group', value: p.blood_group, icon: '🩸' },
            { label: 'Heart Rate', value: `${p.normal_heart_rate_min}–${p.normal_heart_rate_max}`, icon: '💓' },
            { label: 'Blood Pressure', value: `${p.normal_bp_systolic}/${p.normal_bp_diastolic}`, icon: '🩺' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,.15)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, marginBottom: 3 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{s.value}</div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Personal Info */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p className="section-title" style={{ marginBottom: 0 }}>Personal Information</p>
          </div>
          {[
            ['Date of Birth', p.date_of_birth],
            ['Gender', p.gender],
            ['NIC / ID', p.nic || '—'],
            ['Account Type', u?.account_type],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{v || '—'}</span>
            </div>
          ))}
        </div>

        {/* Editable Health Data */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p className="section-title" style={{ marginBottom: 0 }}>Health & Vitals</p>
            {!editing ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            )}
          </div>

          {!editing ? (
            [
              ['Height', p.height_cm ? `${p.height_cm} cm` : '—'],
              ['Weight', p.weight_kg ? `${p.weight_kg} kg` : '—'],
              ['Normal Heart Rate', `${p.normal_heart_rate_min}–${p.normal_heart_rate_max} bpm`],
              ['Normal Blood Pressure', `${p.normal_bp_systolic}/${p.normal_bp_diastolic} mmHg`],
              ['Normal Temperature', `${p.normal_temperature}°C`],
              ['Oxygen Saturation', `${p.normal_oxygen_saturation}%`],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="input-group"><label>Height (cm)</label><input className="input" type="number" value={form.heightCm} onChange={e => setForm(f => ({ ...f, heightCm: e.target.value }))} /></div>
                <div className="input-group"><label>Weight (kg)</label><input className="input" type="number" value={form.weightKg} onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="input-group"><label>HR Min (bpm)</label><input className="input" type="number" value={form.normalHeartRateMin} onChange={e => setForm(f => ({ ...f, normalHeartRateMin: e.target.value }))} /></div>
                <div className="input-group"><label>HR Max (bpm)</label><input className="input" type="number" value={form.normalHeartRateMax} onChange={e => setForm(f => ({ ...f, normalHeartRateMax: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="input-group"><label>Systolic BP</label><input className="input" type="number" value={form.normalBpSystolic} onChange={e => setForm(f => ({ ...f, normalBpSystolic: e.target.value }))} /></div>
                <div className="input-group"><label>Diastolic BP</label><input className="input" type="number" value={form.normalBpDiastolic} onChange={e => setForm(f => ({ ...f, normalBpDiastolic: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="input-group"><label>Temperature (°C)</label><input className="input" type="number" step="0.1" value={form.normalTemperature} onChange={e => setForm(f => ({ ...f, normalTemperature: e.target.value }))} /></div>
                <div className="input-group"><label>O₂ Saturation (%)</label><input className="input" type="number" value={form.normalOxygenSaturation} onChange={e => setForm(f => ({ ...f, normalOxygenSaturation: e.target.value }))} /></div>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Contact (Editable) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p className="section-title" style={{ marginBottom: 0 }}>🆘 Emergency Contact</p>
            {!editing && <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button>}
          </div>
          {!editing ? (
            [
              ['Name', p.emergency_contact_name || '—'],
              ['Phone', p.emergency_contact_phone || '—'],
              ['Relation', p.emergency_contact_relation || '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="input-group"><label>Contact Name</label><input className="input" value={form.emergencyContactName} onChange={e => setForm(f => ({ ...f, emergencyContactName: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="input-group"><label>Phone</label><input className="input" value={form.emergencyContactPhone} onChange={e => setForm(f => ({ ...f, emergencyContactPhone: e.target.value }))} /></div>
                <div className="input-group"><label>Relation</label><input className="input" value={form.emergencyContactRelation} onChange={e => setForm(f => ({ ...f, emergencyContactRelation: e.target.value }))} /></div>
              </div>
            </div>
          )}
        </div>

        {/* Allergies */}
        {allergies.length > 0 && (
          <div className="card">
            <p className="section-title">⚠️ My Allergies</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {allergies.map((a, i) => (
                <span key={i} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: '#fee2e2', color: '#ef4444' }}>
                  {a.custom_allergy || a.allergy?.name}
                  {a.severity && <span style={{ opacity: 0.6, fontSize: 11, marginLeft: 4 }}>({a.severity})</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Conditions */}
        {conditions.length > 0 && (
          <div className="card">
            <p className="section-title">🏥 Active Conditions</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {conditions.map((c, i) => (
                <span key={i} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: '#eff6ff', color: '#2563eb' }}>
                  {c.custom_condition || c.condition?.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Emergency QR */}
        {qr && (
          <div className="card">
            <p className="section-title">📱 Emergency QR Code</p>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14, lineHeight: 1.5 }}>
              This QR gives emergency responders instant access to your critical health data — blood group, allergies, conditions, and emergency contacts. Keep it accessible.
            </p>
            {qr.qr_image_path && (
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <img src={qr.qr_image_path} alt="Emergency QR" style={{ width: 160, height: 160, border: '3px solid #2563eb', borderRadius: 12 }} />
              </div>
            )}
            <a href={qr.qr_image_path} download="emergency-qr.png" className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none' }}>
              ⬇ Download QR Code
            </a>
          </div>
        )}

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Link to="/booking" style={{ background: '#eff6ff', borderRadius: 14, padding: '14px', display: 'flex', flexDirection: 'column', gap: 6, textDecoration: 'none' }}>
            <span style={{ fontSize: 24 }}>🏥</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#2563eb' }}>Find a Doctor</span>
          </Link>
          <Link to="/appointments" style={{ background: '#f0fdf4', borderRadius: 14, padding: '14px', display: 'flex', flexDirection: 'column', gap: 6, textDecoration: 'none' }}>
            <span style={{ fontSize: 24 }}>📅</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#059669' }}>My Appointments</span>
          </Link>
          <Link to="/vault" style={{ background: '#fef3c7', borderRadius: 14, padding: '14px', display: 'flex', flexDirection: 'column', gap: 6, textDecoration: 'none' }}>
            <span style={{ fontSize: 24 }}>📁</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#d97706' }}>Health Vault</span>
          </Link>
          <Link to="/ai" style={{ background: '#f5f3ff', borderRadius: 14, padding: '14px', display: 'flex', flexDirection: 'column', gap: 6, textDecoration: 'none' }}>
            <span style={{ fontSize: 24 }}>🤖</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#7c3aed' }}>AI Engine</span>
          </Link>
        </div>

        {/* Sign out */}
        <button onClick={handleLogout} style={{ width: '100%', padding: '14px', background: '#fee2e2', color: '#ef4444', borderRadius: 12, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 8 }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
