import { useState, useEffect, createContext, useContext } from 'react';
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

// ─── AUTH CONTEXT ─────────────────────────────────────────────
const Ctx = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });
  async function login(username, password) {
    const { data } = await API.post('/auth/staff/login', { username, password });
    if (data.success) {
      const allowed = ['medical_staff', 'nurse', 'lab_technician', 'receptionist', 'doctor'];
      if (!allowed.includes(data.data.role)) throw new Error('Access denied for this portal');
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('user', JSON.stringify({ ...data.data.user, role: data.data.role }));
      setUser({ ...data.data.user, role: data.data.role });
    }
    return data;
  }
  function logout() { localStorage.clear(); setUser(null); }
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}
const useAuth = () => useContext(Ctx);

// ─── SIDEBAR ──────────────────────────────────────────────────
function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/patients', label: 'Patients', icon: '👥' },
    { to: '/appointments', label: 'Appointments', icon: '📅' },
    { to: '/patient-records', label: 'Patient Records', icon: '🗂️' },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>🏥</span>
        <div><h2>MediCare AI</h2><p>Medical Staff Portal</p></div>
      </div>
      <nav className="sidebar-nav">
        {links.map(l => <NavLink key={l.to} to={l.to} end={l.to === '/'}>{l.icon} {l.label}</NavLink>)}
      </nav>
      <div className="sidebar-user">
        <p style={{ fontWeight: 600, fontSize: 13 }}>{user?.first_name} {user?.last_name}</p>
        <p style={{ fontSize: 12, color: 'var(--gray-400)', textTransform: 'capitalize', marginTop: 2 }}>{user?.role?.replace('_', ' ')}</p>
        <button className="btn btn-secondary btn-sm" style={{ marginTop: 8, width: '100%' }} onClick={() => { logout(); navigate('/login'); }}>Sign Out</button>
      </div>
    </aside>
  );
}

// ─── LAYOUT ───────────────────────────────────────────────────
function Layout({ children, title }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="topbar"><h1>{title}</h1></div>
        <div className="page">{children}</div>
      </main>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1e40af,#3b82f6)' }}>
      <div className="card" style={{ width: 380, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏥</div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Medical Staff Portal</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 4 }}>Sign in with your staff credentials</p>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group"><label>Username</label><input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required /></div>
          <div className="input-group"><label>Password</label><input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required /></div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────
function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    API.get('/staff/appointments', { params: { date: new Date().toISOString().split('T')[0], limit: 10 } })
      .then(r => setAppointments(r.data.data?.appointments || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);
  return (
    <Layout title="Dashboard">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.first_name}! 👋</h2>
        <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div className="card">
        <p className="section-title">Today's Appointments</p>
        {loading ? <div className="spinner" /> : appointments.length === 0 ? (
          <div className="empty-state"><div className="icon">📅</div><p>No appointments today</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Patient</th><th>Time</th><th>Doctor</th><th>Status</th><th>Reason</th></tr></thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.patient?.medicalProfile?.first_name} {a.patient?.medicalProfile?.last_name}</strong><br/><span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{a.patient?.email || a.patient?.phone}</span></td>
                    <td>{a.scheduled_time}</td>
                    <td>Dr. {a.doctor?.first_name} {a.doctor?.last_name}</td>
                    <td><span className={`badge badge-${a.status === 'confirmed' ? 'green' : a.status === 'cancelled' ? 'red' : 'yellow'}`}>{a.status}</span></td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

// ─── PATIENTS ─────────────────────────────────────────────────
function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function load() {
    setLoading(true);
    try { const r = await API.get('/staff/patients', { params: { search, limit: 30 } }); setPatients(r.data.data?.patients || []); }
    finally { setLoading(false); }
  }
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search]);
  return (
    <Layout title="Patients">
      <div className="flex justify-between items-center mb-4">
        <div className="search-bar flex-1" style={{ maxWidth: 360 }}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients…" />
        </div>
      </div>
      <div className="card">
        {loading ? <div className="spinner" /> : patients.length === 0 ? (
          <div className="empty-state"><div className="icon">👥</div><p>No patients found</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Contact</th><th>Type</th><th>Registered</th><th>Actions</th></tr></thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.medicalProfile?.first_name || '—'} {p.medicalProfile?.last_name || ''}</strong></td>
                    <td>{p.email || p.phone}</td>
                    <td><span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{p.account_type}</span></td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td><button className="btn btn-secondary btn-sm" onClick={() => navigate(`/patients/${p.id}`)}>View Records</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

// ─── PATIENT RECORD ───────────────────────────────────────────
function PatientRecord() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    API.get(`/staff/patients/${id}`).then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, [id]);
  if (loading) return <Layout title="Patient Record"><div className="spinner" /></Layout>;
  if (!data) return <Layout title="Patient Record"><p>Not found</p></Layout>;
  const { profile, allergies, conditions, recentDocuments, appointments } = data;
  return (
    <Layout title={`${profile?.first_name || ''} ${profile?.last_name || ''}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <p className="section-title">Patient Info</p>
            {[['Name', `${profile?.first_name} ${profile?.last_name}`], ['DOB', profile?.date_of_birth], ['Gender', profile?.gender], ['Blood Group', profile?.blood_group], ['NIC', profile?.nic || '—'], ['Height', profile?.height_cm ? `${profile.height_cm} cm` : '—'], ['Weight', profile?.weight_kg ? `${profile.weight_kg} kg` : '—']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)', textTransform: 'capitalize' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: 13 }}>{l}</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
              </div>
            ))}
          </div>
          {allergies?.length > 0 && (
            <div className="card">
              <p className="section-title">⚠️ Allergies</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {allergies.map((a, i) => <span key={i} className="chip chip-danger">{a.custom_allergy || a.allergy?.name}</span>)}
              </div>
            </div>
          )}
          {conditions?.length > 0 && (
            <div className="card">
              <p className="section-title">🏥 Conditions</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {conditions.map((c, i) => <span key={i} className="chip">{c.custom_condition || c.condition?.name}</span>)}
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <p className="section-title">📄 Documents ({recentDocuments?.length || 0})</p>
            {recentDocuments?.length === 0 ? <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>No documents</p> :
              recentDocuments?.map(doc => (
                <div key={doc.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--gray-100)', alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>{doc.title || doc.original_name}</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{doc.document_date} · {doc.category}</p>
                  </div>
                  {doc.is_ai_analyzed && <span className="badge badge-blue" style={{ fontSize: 11 }}>AI ✓</span>}
                  <a href={doc.file_path} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">View</a>
                </div>
              ))
            }
          </div>
          <div className="card">
            <p className="section-title">📅 Recent Appointments</p>
            {appointments?.length === 0 ? <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>No appointments</p> :
              appointments?.slice(0, 5).map(a => (
                <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>{a.scheduled_date} at {a.scheduled_time}</p>
                    <span className={`badge badge-${a.status === 'completed' ? 'green' : a.status === 'cancelled' ? 'red' : 'yellow'}`}>{a.status}</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ─── APPOINTMENTS VIEW ────────────────────────────────────────
function Appointments() {
  const [appts, setAppts] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    API.get('/staff/appointments', { params: { date } }).then(r => setAppts(r.data.data?.appointments || [])).finally(() => setLoading(false));
  }, [date]);
  return (
    <Layout title="Appointments">
      <div className="flex gap-4 mb-4 items-center">
        <div className="input-group" style={{ width: 200 }}><label>Filter by Date</label><input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} /></div>
      </div>
      <div className="card">
        {loading ? <div className="spinner" /> : appts.length === 0 ? (
          <div className="empty-state"><div className="icon">📅</div><p>No appointments for this date</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th><th>Reason</th></tr></thead>
              <tbody>
                {appts.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 700 }}>{a.scheduled_time}</td>
                    <td>{a.patient?.medicalProfile?.first_name} {a.patient?.medicalProfile?.last_name}<br/><span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{a.patient?.email || a.patient?.phone}</span></td>
                    <td>Dr. {a.doctor?.first_name} {a.doctor?.last_name}<br/><span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{a.doctor?.specialization}</span></td>
                    <td><span className={`badge badge-${a.status === 'confirmed' ? 'green' : a.status === 'completed' ? 'blue' : a.status === 'cancelled' ? 'red' : 'yellow'}`}>{a.status}</span></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

// ─── PATIENT RECORDS SEARCH ────────────────────────────────────
function PatientRecords() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (search.length < 2) { setPatients([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { const r = await API.get('/staff/patients', { params: { search } }); setPatients(r.data.data?.patients || []); }
      finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);
  return (
    <Layout title="Patient Records">
      <div className="card" style={{ marginBottom: 20, maxWidth: 600 }}>
        <p className="section-title">🔍 Search Patient</p>
        <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or phone…" />
      </div>
      {loading ? <div className="spinner" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {patients.map(p => (
            <div key={p.id} className="card" style={{ display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(`/patients/${p.id}`)}>
              <div style={{ width: 44, height: 44, background: 'var(--primary-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700 }}>{p.medicalProfile?.first_name || '—'} {p.medicalProfile?.last_name || ''}</p>
                <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>{p.email || p.phone}</p>
              </div>
              <span style={{ color: 'var(--primary)', fontSize: 20 }}>›</span>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

// ─── APP ──────────────────────────────────────────────────────
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
          <Route path="/patients" element={<Guard><Patients /></Guard>} />
          <Route path="/patients/:id" element={<Guard><PatientRecord /></Guard>} />
          <Route path="/appointments" element={<Guard><Appointments /></Guard>} />
          <Route path="/patient-records" element={<Guard><PatientRecords /></Guard>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
