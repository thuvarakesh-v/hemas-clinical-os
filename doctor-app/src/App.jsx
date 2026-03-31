import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// ─── API ──────────────────────────────────────────────────────
const API = axios.create({ baseURL: '/api/v1' });
API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
API.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) { localStorage.clear(); window.location.href = '/login'; }
  return Promise.reject(err);
});

// ─── Auth ─────────────────────────────────────────────────────
const AuthCtx = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });
  async function login(username, password) {
    const { data } = await API.post('/auth/staff/login', { username, password });
    if (data.success) {
      if (data.data.role !== 'doctor') throw new Error('This portal is for doctors only. Staff please use the Medical Staff portal.');
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify({ ...data.data.user, role: 'doctor' }));
      setUser({ ...data.data.user, role: 'doctor' });
    }
    return data;
  }
  function logout() { localStorage.clear(); setUser(null); }
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}
const useAuth = () => useContext(AuthCtx);

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/', icon: '📊', label: 'Dashboard' },
    { to: '/appointments', icon: '📅', label: 'Appointments' },
    { to: '/patients', icon: '👥', label: 'My Patients' },
    { to: '/schedule', icon: '🗓️', label: 'My Schedule' },
    { to: '/profile', icon: '👨‍⚕️', label: 'My Profile' },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>👨‍⚕️</span>
        <div>
          <h2 style={{ fontSize: 14 }}>Dr. {user?.first_name} {user?.last_name}</h2>
          <p>{user?.specialization || 'Doctor Portal'}</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map(l => <NavLink key={l.to} to={l.to} end={l.to === '/'}>{l.icon} {l.label}</NavLink>)}
      </nav>
      <div className="sidebar-user">
        <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{user?.email}</p>
        <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
          ⭐ {user?.rating || 0} · {user?.patient_count || 0} patients
        </p>
        <button className="btn btn-secondary btn-sm" style={{ marginTop: 8, width: '100%' }}
          onClick={() => { logout(); navigate('/login'); }}>Sign Out</button>
      </div>
    </aside>
  );
}

function Layout({ children, title, actions }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="topbar">
          <h1>{title}</h1>
          {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
        </div>
        <div className="page">{children}</div>
      </main>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────
function useToast() {
  const [t, setT] = useState(null);
  const show = (msg, type = 'success') => { setT({ msg, type }); setTimeout(() => setT(null), 3000); };
  const Toast = t ? (
    <div style={{ position: 'fixed', top: 20, right: 20, padding: '12px 20px', borderRadius: 10, background: t.type === 'success' ? '#10b981' : '#ef4444', color: '#fff', zIndex: 9999, fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}>
      {t.msg}
    </div>
  ) : null;
  return { show, Toast };
}

// ─── Login ────────────────────────────────────────────────────
function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/" />;

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(form.username, form.password); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || err.message || 'Login failed'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0c4a6e,#0369a1)' }}>
      <div style={{ width: 400, background: '#fff', borderRadius: 20, padding: 36, boxShadow: '0 25px 50px rgba(0,0,0,.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>👨‍⚕️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Doctor Portal</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 4 }}>MediCare AI Hospital System</p>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group">
            <label>Username</label>
            <input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="e.g. dr.smith" required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
          <button type="submit" className="btn btn-primary btn-lg" style={{ background: '#0369a1' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In to Doctor Portal'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--gray-400)' }}>
          Default credentials: username from admin panel, password: Doctor@123
        </p>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────
function Dashboard() {
  const { user } = useAuth();
  const [todayAppts, setTodayAppts] = useState([]);
  const [upcomingAppts, setUpcomingAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      API.get('/doctor/appointments', { params: { date: today } }),
      API.get('/doctor/appointments', { params: { status: 'confirmed' } }),
    ]).then(([todayRes, upcomingRes]) => {
      setTodayAppts(todayRes.data.data || []);
      setUpcomingAppts(upcomingRes.data.data?.filter(a => a.scheduled_date > today).slice(0, 5) || []);
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Today's Appointments", value: todayAppts.length, icon: '📅', color: '#2563eb', bg: '#dbeafe' },
    { label: 'Confirmed', value: todayAppts.filter(a => a.status === 'confirmed').length, icon: '✅', color: '#059669', bg: '#d1fae5' },
    { label: 'Completed Today', value: todayAppts.filter(a => a.status === 'completed').length, icon: '✔️', color: '#7c3aed', bg: '#ede9fe' },
    { label: 'Total Patients', value: user?.patient_count || 0, icon: '👥', color: '#d97706', bg: '#fef3c7' },
  ];

  const greet = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Layout title="Dashboard">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{greet}, Dr. {user?.first_name}! 👋</h2>
        <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="icon" style={{ background: s.bg }}>{s.icon}</div>
            <div>
              <div className="value" style={{ color: s.color }}>{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        {/* Today's schedule */}
        <div className="card">
          <p className="section-title">📅 Today's Schedule — {today}</p>
          {loading ? <div className="spinner" /> : todayAppts.length === 0 ? (
            <div className="empty-state"><div className="icon">🗓️</div><p>No appointments today</p><span>Enjoy your free day!</span></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayAppts.map(a => (
                <AppointmentCard key={a.id} appt={a} showActions onRefresh={() => {
                  API.get('/doctor/appointments', { params: { date: today } }).then(r => setTodayAppts(r.data.data || []));
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div className="card">
          <p className="section-title">🗓️ Upcoming Appointments</p>
          {loading ? <div className="spinner" /> : upcomingAppts.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>No upcoming appointments</p>
          ) : (
            upcomingAppts.map(a => (
              <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <p style={{ fontWeight: 700, fontSize: 13 }}>{a.patient?.medicalProfile?.first_name} {a.patient?.medicalProfile?.last_name}</p>
                <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                  {a.scheduled_date} at {a.scheduled_time}
                </p>
                {a.reason && <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2, fontStyle: 'italic' }}>{a.reason}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

// ─── Appointment Card (reusable) ──────────────────────────────
function AppointmentCard({ appt: a, showActions, onRefresh }) {
  const { show, Toast } = useToast();
  const [notesModal, setNotesModal] = useState(false);
  const navigate = useNavigate();

  const statusColors = {
    confirmed: { bg: '#d1fae5', color: '#065f46' },
    pending:   { bg: '#fef3c7', color: '#92400e' },
    completed: { bg: '#dbeafe', color: '#1d4ed8' },
    cancelled: { bg: '#fee2e2', color: '#991b1b' },
    no_show:   { bg: '#f3f4f6', color: '#6b7280' },
  };
  const sc = statusColors[a.status] || statusColors.pending;

  async function updateStatus(status) {
    try {
      await API.put(`/doctor/appointments/${a.id}`, { status });
      show(`Appointment marked as ${status}`);
      onRefresh?.();
    } catch { show('Update failed', 'error'); }
  }

  return (
    <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14, border: '1px solid var(--gray-200)' }}>
      {Toast}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ background: '#eff6ff', borderRadius: 10, padding: '8px 12px', textAlign: 'center', minWidth: 56, flexShrink: 0 }}>
          <p style={{ fontWeight: 800, fontSize: 16, color: '#2563eb' }}>{a.scheduled_time}</p>
          <p style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2 }}>{a.duration_minutes}min</p>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>
              {a.patient?.medicalProfile?.first_name || '—'} {a.patient?.medicalProfile?.last_name || ''}
            </p>
            <span style={{ background: sc.bg, color: sc.color, padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'capitalize', flexShrink: 0 }}>
              {a.status}
            </span>
          </div>
          {a.reason && <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 3 }}>📋 {a.reason}</p>}
          {a.patient?.medicalProfile?.blood_group && (
            <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>🩸 {a.patient.medicalProfile.blood_group}</p>
          )}
          {showActions && a.status !== 'cancelled' && a.status !== 'completed' && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button className="btn btn-success btn-sm" onClick={() => updateStatus('completed')}>✓ Complete</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setNotesModal(true)}>📝 Notes</button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/patients/${a.patient_id}`)}>View Patient</button>
              <button className="btn btn-danger btn-sm" style={{ background: '#fee2e2', color: '#ef4444' }} onClick={() => updateStatus('no_show')}>No Show</button>
            </div>
          )}
        </div>
      </div>
      {notesModal && <DoctorNotesModal apptId={a.id} existing={a.doctor_notes} prescription={a.prescription} onClose={() => { setNotesModal(false); onRefresh?.(); }} show={show} />}
    </div>
  );
}

// ─── Doctor Notes Modal ───────────────────────────────────────
function DoctorNotesModal({ apptId, existing, prescription, onClose, show }) {
  const [notes, setNotes] = useState(existing || '');
  const [rx, setRx] = useState(prescription ? JSON.stringify(prescription, null, 2) : '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      let parsedRx = null;
      if (rx.trim()) {
        try { parsedRx = JSON.parse(rx); } catch { parsedRx = rx.split('\n').filter(Boolean).map(l => ({ medication: l })); }
      }
      await API.put(`/doctor/appointments/${apptId}`, { doctorNotes: notes, prescription: parsedRx, status: 'completed' });
      show('Notes saved and appointment completed');
      onClose();
    } catch { show('Save failed', 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>📝 Doctor's Notes & Prescription</h2>
          <button onClick={onClose} style={{ background: 'none', fontSize: 22, color: 'var(--gray-400)', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group">
            <label>Clinical Notes</label>
            <textarea className="input" rows={5} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Patient complaints, examination findings, diagnosis, plan…" />
          </div>
          <div className="input-group">
            <label>Prescription (one item per line)</label>
            <textarea className="input" rows={4} value={rx} onChange={e => setRx(e.target.value)} placeholder="Amoxicillin 500mg — 1 tablet 3x daily for 7 days&#10;Paracetamol 500mg — as needed for pain" />
          </div>
          <button className="btn btn-success btn-lg" onClick={save} disabled={saving}>{saving ? 'Saving…' : '💾 Save & Complete Appointment'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── All Appointments ─────────────────────────────────────────
function Appointments() {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ date: '', status: '' });

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (filters.date) params.date = filters.date;
      if (filters.status) params.status = filters.status;
      const { data } = await API.get('/doctor/appointments', { params });
      setAppts(data.data || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filters]);

  return (
    <Layout title="📅 Appointments">
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="input-group" style={{ width: 200 }}>
          <label>Date</label>
          <input type="date" className="input" value={filters.date} onChange={e => setFilters(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div className="input-group" style={{ width: 180 }}>
          <label>Status</label>
          <select className="input" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All</option>
            {['pending','confirmed','completed','cancelled','no_show'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setFilters({ date: '', status: '' })}>Clear</button>
        </div>
      </div>

      {loading ? <div className="spinner" /> : appts.length === 0 ? (
        <div className="card empty-state"><div className="icon">📅</div><p>No appointments found</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {appts.map(a => (
            <div key={a.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: 'var(--gray-50)', padding: '8px 16px', borderBottom: '1px solid var(--gray-200)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)' }}>{a.scheduled_date}</span>
                <span style={{ color: 'var(--gray-300)' }}>•</span>
                <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{a.scheduled_time}</span>
              </div>
              <div style={{ padding: 14 }}>
                <AppointmentCard appt={a} showActions={a.status === 'confirmed' || a.status === 'pending'} onRefresh={load} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

// ─── My Patients ──────────────────────────────────────────────
function MyPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/doctor/patients').then(r => setPatients(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p => {
    const name = `${p.medicalProfile?.first_name || ''} ${p.medicalProfile?.last_name || ''}`.toLowerCase();
    const contact = `${p.email || ''} ${p.phone || ''}`.toLowerCase();
    return !search || name.includes(search.toLowerCase()) || contact.includes(search.toLowerCase());
  });

  return (
    <Layout title="👥 My Patients">
      <div style={{ marginBottom: 16, maxWidth: 400 }}>
        <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients by name or contact…" />
      </div>
      {loading ? <div className="spinner" /> : (
        <div className="card">
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="icon">👥</div><p>No patients yet</p><span>Patients appear after their first appointment</span></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th><th>Contact</th><th>Blood Group</th><th>Allergies</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.medicalProfile?.first_name || '—'} {p.medicalProfile?.last_name || ''}</strong>
                        <br /><span style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                          {p.medicalProfile?.date_of_birth ? `DOB: ${p.medicalProfile.date_of_birth}` : ''}
                        </span>
                      </td>
                      <td>{p.email || p.phone}</td>
                      <td>
                        <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                          🩸 {p.medicalProfile?.blood_group || '?'}
                        </span>
                      </td>
                      <td style={{ maxWidth: 150 }}>
                        {p.userAllergies?.slice(0, 2).map((a, i) => (
                          <span key={i} className="chip chip-danger" style={{ marginRight: 4, marginBottom: 2 }}>
                            {a.custom_allergy || a.allergy?.name}
                          </span>
                        ))}
                        {p.userAllergies?.length > 2 && <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>+{p.userAllergies.length - 2} more</span>}
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/patients/${p.id}`)}>
                          View Full Record
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

// ─── Patient Full View ────────────────────────────────────────
function PatientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    API.get(`/doctor/patients/${id}`)
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout title="Patient Record"><div className="spinner" /></Layout>;
  if (!data) return <Layout title="Patient Record"><div className="empty-state"><div className="icon">❌</div><p>Patient not found</p></div></Layout>;

  const { profile, allergies, conditions, recentDocuments, aiAnalyses, appointments } = data;
  const p = profile;

  const tabs = ['overview', 'documents', 'ai analyses', 'appointments'];

  return (
    <Layout
      title={`${p?.first_name || '—'} ${p?.last_name || ''}`}
      actions={[<button key="back" className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>]}
    >
      {/* Patient summary bar */}
      <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg,#0c4a6e,#0369a1)', color: '#fff' }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👤</div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>{p?.first_name} {p?.last_name}</h2>
              <p style={{ opacity: 0.8, fontSize: 14, marginTop: 2 }}>
                {p?.date_of_birth && `Born ${p.date_of_birth}`} · {p?.gender} · NIC: {p?.nic || 'N/A'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginLeft: 'auto', alignItems: 'center' }}>
            {[
              { label: 'Blood Group', value: p?.blood_group || '?', icon: '🩸' },
              { label: 'Heart Rate', value: `${p?.normal_heart_rate_min}–${p?.normal_heart_rate_max}`, icon: '💓' },
              { label: 'BP', value: `${p?.normal_bp_systolic}/${p?.normal_bp_diastolic}`, icon: '🩺' },
              { label: 'O₂ Sat', value: `${p?.normal_oxygen_saturation}%`, icon: '💨' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,.12)', borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, opacity: 0.7 }}>{s.icon} {s.label}</p>
                <p style={{ fontWeight: 800, fontSize: 16 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Allergy warning */}
        {allergies?.length > 0 && (
          <div style={{ marginTop: 14, background: 'rgba(239,68,68,.25)', border: '1px solid rgba(239,68,68,.4)', borderRadius: 10, padding: '10px 14px' }}>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>⚠️ KNOWN ALLERGIES — Clinical Alert</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {allergies.map((a, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,.2)', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                  {a.custom_allergy || a.allergy?.name} {a.severity ? `(${a.severity})` : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', padding: 6, borderRadius: 12, boxShadow: 'var(--shadow)', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, background: tab === t ? '#0369a1' : 'transparent', color: tab === t ? '#fff' : 'var(--gray-500)', border: 'none', cursor: 'pointer', textTransform: 'capitalize', transition: 'all .15s' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <p className="section-title">Active Conditions</p>
            {conditions?.length === 0 ? <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>No conditions recorded</p> :
              conditions?.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--gray-100)', alignItems: 'center' }}>
                  <div style={{ width: 8, height: 8, background: '#2563eb', borderRadius: 99, flexShrink: 0 }} />
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{c.custom_condition || c.condition?.name}</p>
                  {c.diagnosed_date && <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 'auto' }}>Since {c.diagnosed_date}</span>}
                </div>
              ))
            }
          </div>
          <div className="card">
            <p className="section-title">Contact & Emergency</p>
            {[
              ['Email', data.user?.email],
              ['Phone', data.user?.phone],
              ['Emergency Contact', p?.emergency_contact_name],
              ['Emergency Phone', p?.emergency_contact_phone],
              ['Relation', p?.emergency_contact_relation],
              ['Height', p?.height_cm ? `${p.height_cm} cm` : null],
              ['Weight', p?.weight_kg ? `${p.weight_kg} kg` : null],
            ].filter(([, v]) => v).map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'documents' && (
        <div className="card">
          <p className="section-title">Medical Documents ({recentDocuments?.length || 0})</p>
          {!recentDocuments?.length ? <p style={{ color: 'var(--gray-400)' }}>No documents</p> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Title</th><th>Date</th><th>Category</th><th>Uploaded By</th><th>AI</th><th>Actions</th></tr></thead>
                <tbody>
                  {recentDocuments.map(doc => (
                    <tr key={doc.id}>
                      <td><strong>{doc.title || doc.original_name}</strong></td>
                      <td>{doc.document_date}</td>
                      <td><span className="badge badge-gray">{doc.category}</span></td>
                      <td><span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{doc.uploaded_by_type}</span></td>
                      <td>{doc.is_ai_analyzed ? <span className="badge badge-green">✓ Done</span> : <span className="badge badge-yellow">Pending</span>}</td>
                      <td><a href={doc.file_path} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">View</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'ai analyses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!aiAnalyses?.length ? <div className="card empty-state"><div className="icon">🤖</div><p>No AI analyses yet</p></div> :
            aiAnalyses.map(a => (
              <div key={a.id} className="card">
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{a.analysis_type}</span>
                    {a.urgency_level && <span className={`badge ${a.urgency_level === 'routine' ? 'badge-green' : a.urgency_level === 'urgent' ? 'badge-red' : 'badge-yellow'}`}>{a.urgency_level}</span>}
                    {a.recommended_specialty && <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>→ {a.recommended_specialty}</span>}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
                {a.summary && <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.5 }}>{a.summary}</p>}
                {a.confidence_score && <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6 }}>Confidence: {Math.round(a.confidence_score * 100)}%</p>}
              </div>
            ))
          }
        </div>
      )}

      {tab === 'appointments' && (
        <div className="card">
          <p className="section-title">Appointment History</p>
          {!appointments?.length ? <p style={{ color: 'var(--gray-400)' }}>No appointments</p> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Time</th><th>Status</th><th>Reason</th><th>Notes</th></tr></thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a.id}>
                      <td>{a.scheduled_date}</td>
                      <td>{a.scheduled_time}</td>
                      <td><span className={`badge badge-${a.status === 'completed' ? 'green' : a.status === 'cancelled' ? 'red' : 'yellow'}`}>{a.status}</span></td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason || '—'}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.doctor_notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

// ─── Schedule (availability settings) ────────────────────────
function Schedule() {
  const { user } = useAuth();
  const { show, Toast } = useToast();
  const [form, setForm] = useState({
    slotStartTime: user?.slot_start_time || '09:00',
    slotEndTime: user?.slot_end_time || '17:00',
    slotDurationMinutes: user?.slot_duration_minutes || 30,
    availableDays: user?.available_days || [1, 2, 3, 4, 5],
    consultationFee: user?.consultation_fee || 0,
  });
  const [saving, setSaving] = useState(false);
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function toggleDay(d) {
    setForm(f => ({
      ...f,
      availableDays: f.availableDays.includes(d)
        ? f.availableDays.filter(x => x !== d)
        : [...f.availableDays, d].sort(),
    }));
  }

  async function save() {
    setSaving(true);
    try {
      await API.put('/doctor/profile', {
        slotStartTime: form.slotStartTime,
        slotEndTime: form.slotEndTime,
        slotDurationMinutes: parseInt(form.slotDurationMinutes),
        availableDays: form.availableDays,
        consultationFee: parseFloat(form.consultationFee),
      });
      show('Schedule updated successfully!');
    } catch { show('Update failed', 'error'); }
    finally { setSaving(false); }
  }

  // Preview slots
  function previewSlots() {
    const slots = [];
    const [sh, sm] = form.slotStartTime.split(':').map(Number);
    const [eh, em] = form.slotEndTime.split(':').map(Number);
    let cur = sh * 60 + sm;
    const end = eh * 60 + em;
    const dur = parseInt(form.slotDurationMinutes);
    while (cur + dur <= end) {
      const h = Math.floor(cur / 60), m = cur % 60;
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      cur += dur;
    }
    return slots;
  }

  return (
    <Layout title="🗓️ My Schedule">
      {Toast}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <p className="section-title">Available Days</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {DAYS.map((d, i) => (
                <button key={i} onClick={() => toggleDay(i)}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: `2px solid ${form.availableDays.includes(i) ? '#2563eb' : 'var(--gray-200)'}`, background: form.availableDays.includes(i) ? '#eff6ff' : '#fff', color: form.availableDays.includes(i) ? '#2563eb' : 'var(--gray-500)', fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all .15s' }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <p className="section-title">Working Hours</p>
            <div className="grid-2" style={{ marginBottom: 14 }}>
              <div className="input-group">
                <label>Start Time</label>
                <input type="time" className="input" value={form.slotStartTime} onChange={e => setForm(f => ({ ...f, slotStartTime: e.target.value }))} />
              </div>
              <div className="input-group">
                <label>End Time</label>
                <input type="time" className="input" value={form.slotEndTime} onChange={e => setForm(f => ({ ...f, slotEndTime: e.target.value }))} />
              </div>
            </div>
            <div className="grid-2">
              <div className="input-group">
                <label>Slot Duration (minutes)</label>
                <select className="input" value={form.slotDurationMinutes} onChange={e => setForm(f => ({ ...f, slotDurationMinutes: e.target.value }))}>
                  {[15, 20, 30, 45, 60].map(d => <option key={d} value={d}>{d} min</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Consultation Fee (LKR)</label>
                <input type="number" className="input" value={form.consultationFee} onChange={e => setForm(f => ({ ...f, consultationFee: e.target.value }))} />
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={save} disabled={saving}>{saving ? 'Saving…' : '💾 Save Schedule'}</button>
        </div>

        <div className="card">
          <p className="section-title">Slot Preview ({previewSlots().length} slots/day)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
            {previewSlots().map(s => (
              <div key={s} style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 10px', borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ─── My Profile ───────────────────────────────────────────────
function DoctorProfile() {
  const { user } = useAuth();
  const { show, Toast } = useToast();
  const [form, setForm] = useState({ bio: user?.bio || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await API.put('/doctor/profile', form);
      show('Profile updated!');
    } catch { show('Update failed', 'error'); }
    finally { setSaving(false); }
  }

  return (
    <Layout title="👨‍⚕️ My Profile">
      {Toast}
      <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
            <div style={{ width: 70, height: 70, background: '#eff6ff', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>👨‍⚕️</div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>Dr. {user?.first_name} {user?.last_name}</h2>
              <p style={{ color: 'var(--gray-500)', marginTop: 2 }}>{user?.specialization}</p>
              <p style={{ color: 'var(--gray-400)', fontSize: 13, marginTop: 2 }}>{user?.qualification}</p>
            </div>
          </div>
          {[
            ['Email', user?.email],
            ['Username', user?.username],
            ['Experience', `${user?.experience_years} years`],
            ['Patients Seen', user?.patient_count],
            ['Rating', `⭐ ${user?.rating}`],
            ['Department', user?.department?.name],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{l}</span>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{v || '—'}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <p className="section-title">Edit Profile</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="input-group">
              <label>Phone</label>
              <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+94 77 123 4567" />
            </div>
            <div className="input-group">
              <label>Professional Bio</label>
              <textarea className="input" rows={5} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Describe your expertise, approach, and specializations…" />
            </div>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Update Profile'}</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ─── Guard & App ──────────────────────────────────────────────
function Guard({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Guard><Dashboard /></Guard>} />
          <Route path="/appointments" element={<Guard><Appointments /></Guard>} />
          <Route path="/patients" element={<Guard><MyPatients /></Guard>} />
          <Route path="/patients/:id" element={<Guard><PatientView /></Guard>} />
          <Route path="/schedule" element={<Guard><Schedule /></Guard>} />
          <Route path="/profile" element={<Guard><DoctorProfile /></Guard>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
