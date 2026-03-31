import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API = axios.create({ baseURL: '/api/v1' });
API.interceptors.request.use(cfg => { const t = localStorage.getItem('token'); if (t) cfg.headers.Authorization = `Bearer ${t}`; return cfg; });
API.interceptors.response.use(r => r, err => { if (err.response?.status === 401) { localStorage.clear(); window.location.href = '/login'; } return Promise.reject(err); });

const Ctx = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });
  async function login(username, password) {
    const { data } = await API.post('/auth/staff/login', { username, password });
    if (data.success) {
      const allowed = ['medicine_staff', 'lab_technician', 'medical_staff', 'receptionist'];
      if (!allowed.includes(data.data.role)) throw new Error('Access denied for this portal');
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('user', JSON.stringify({ ...data.data.user, role: data.data.role }));
      setUser({ ...data.data.user, role: data.data.role });
    }
  }
  function logout() { localStorage.clear(); setUser(null); }
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}
const useAuth = () => useContext(Ctx);

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/upload-report', label: 'Upload Report', icon: '📤' },
    { to: '/patients', label: 'Find Patient', icon: '🔍' },
    { to: '/reports', label: 'All Reports', icon: '📋' },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo"><span>💊</span><div><h2>MediCare AI</h2><p>Medicine & Reports Portal</p></div></div>
      <nav className="sidebar-nav">{links.map(l => <NavLink key={l.to} to={l.to} end={l.to === '/'}>{l.icon} {l.label}</NavLink>)}</nav>
      <div className="sidebar-user">
        <p style={{ fontWeight: 600, fontSize: 13 }}>{user?.first_name} {user?.last_name}</p>
        <p style={{ fontSize: 12, color: 'var(--gray-400)', textTransform: 'capitalize', marginTop: 2 }}>{user?.role?.replace('_', ' ')}</p>
        <button className="btn btn-secondary btn-sm" style={{ marginTop: 8, width: '100%' }} onClick={() => { logout(); navigate('/login'); }}>Sign Out</button>
      </div>
    </aside>
  );
}

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#065f46,#10b981)' }}>
      <div className="card" style={{ width: 380, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}><div style={{ fontSize: 36, marginBottom: 8 }}>💊</div><h1 style={{ fontSize: 20, fontWeight: 700 }}>Medicine & Reports Portal</h1><p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 4 }}>Staff access only</p></div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group"><label>Username</label><input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required /></div>
          <div className="input-group"><label>Password</label><input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required /></div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
          <button type="submit" className="btn btn-success btn-lg" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  return (
    <Layout title="Dashboard">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Welcome, {user?.first_name}! 💊</h2>
        <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Medicine & Reports Management Portal</p>
      </div>
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { icon: '📤', label: 'Upload Report', desc: 'Upload lab results, prescriptions & reports for patients', to: '/upload-report', color: '#10b981', bg: '#d1fae5' },
          { icon: '🔍', label: 'Find Patient', desc: 'Search and view patient records and medical history', to: '/patients', color: '#2563eb', bg: '#dbeafe' },
          { icon: '📋', label: 'All Reports', desc: 'View all uploaded reports and their AI analysis status', to: '/reports', color: '#7c3aed', bg: '#ede9fe' },
        ].map(c => (
          <a key={c.to} href={c.to} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: 'var(--shadow)', textDecoration: 'none', border: `1px solid var(--gray-200)` }}>
            <div style={{ width: 48, height: 48, background: c.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{c.icon}</div>
            <div><p style={{ fontWeight: 700, color: c.color }}>{c.label}</p><p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{c.desc}</p></div>
          </a>
        ))}
      </div>
      <div className="card">
        <p className="section-title">📌 Quick Guide</p>
        {[
          '1. Search for a patient using their name, email, or phone number',
          '2. Select the correct patient from the results',
          '3. Upload their medical reports (PDF, images)',
          '4. The AI will automatically analyze the report and notify the patient',
          '5. Reports are immediately visible in the patient\'s health vault',
        ].map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
            <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: 14 }}>✓</span>
            <p style={{ fontSize: 14, color: 'var(--gray-700)' }}>{tip}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}

function UploadReport() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef();
  const [form, setForm] = useState({ title: '', category: 'lab_report', documentDate: new Date().toISOString().split('T')[0], description: '' });

  useEffect(() => {
    if (search.length < 2) { setPatients([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try { const r = await API.get('/staff/patients', { params: { search, limit: 10 } }); setPatients(r.data.data?.patients || []); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedPatient) return setError('Please select a patient');
    const file = fileRef.current?.files[0];
    if (!file) return setError('Please select a file');
    setError(''); setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('patientId', selectedPatient.id);
      fd.append('title', form.title || file.name);
      fd.append('category', form.category);
      fd.append('documentDate', form.documentDate);
      fd.append('description', form.description);
      await API.post('/staff/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(`✅ Report uploaded successfully for ${selectedPatient.medicalProfile?.first_name || selectedPatient.email}. AI analysis will process shortly.`);
      setSelectedPatient(null); setSearch(''); setPatients([]);
      fileRef.current.value = ''; setForm({ title: '', category: 'lab_report', documentDate: new Date().toISOString().split('T')[0], description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  }

  return (
    <Layout title="Upload Report">
      <div style={{ maxWidth: 700 }}>
        {success && <div style={{ background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#065f46', fontWeight: 600 }}>{success}</div>}
        {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#991b1b' }}>{error}</div>}

        <div className="card" style={{ marginBottom: 20 }}>
          <p className="section-title">Step 1 — Find Patient</p>
          <input className="input" value={search} onChange={e => { setSearch(e.target.value); setSelectedPatient(null); }} placeholder="Search patient by name, email or phone…" />
          {searching && <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 8 }}>Searching…</p>}
          {patients.length > 0 && !selectedPatient && (
            <div style={{ marginTop: 10, border: '1px solid var(--gray-200)', borderRadius: 10, overflow: 'hidden' }}>
              {patients.map(p => (
                <div key={p.id} onClick={() => { setSelectedPatient(p); setSearch(`${p.medicalProfile?.first_name || ''} ${p.medicalProfile?.last_name || ''} — ${p.email || p.phone}`); setPatients([]); }}
                  style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <div style={{ width: 36, height: 36, background: 'var(--primary-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{p.medicalProfile?.first_name || '—'} {p.medicalProfile?.last_name || ''}</p>
                    <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{p.email || p.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {selectedPatient && (
            <div style={{ marginTop: 10, background: '#d1fae5', border: '2px solid #10b981', borderRadius: 10, padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 24 }}>✅</span>
              <div>
                <p style={{ fontWeight: 700, color: '#065f46' }}>Selected: {selectedPatient.medicalProfile?.first_name} {selectedPatient.medicalProfile?.last_name}</p>
                <p style={{ fontSize: 12, color: '#047857' }}>{selectedPatient.email || selectedPatient.phone}</p>
              </div>
              <button style={{ marginLeft: 'auto', background: 'none', color: '#ef4444', fontSize: 18 }} onClick={() => { setSelectedPatient(null); setSearch(''); }}>×</button>
            </div>
          )}
        </div>

        <div className="card">
          <p className="section-title">Step 2 — Upload Document</p>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="input-group"><label>File (PDF, Images) *</label><input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="input" required /></div>
            <div className="grid-2">
              <div className="input-group">
                <label>Title</label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Complete Blood Count" />
              </div>
              <div className="input-group">
                <label>Category</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {['lab_report', 'prescription', 'imaging', 'discharge', 'consultation', 'vaccination', 'other'].map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group"><label>Document Date</label><input type="date" className="input" value={form.documentDate} onChange={e => setForm(f => ({ ...f, documentDate: e.target.value }))} /></div>
            <div className="input-group"><label>Description (Optional)</label><textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the document…" /></div>
            <button type="submit" className="btn btn-success btn-lg" disabled={uploading || !selectedPatient}>{uploading ? 'Uploading & Analyzing…' : '📤 Upload Report'}</button>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'center' }}>PDF reports will be automatically analyzed by AI and the results made available to the patient.</p>
          </form>
        </div>
      </div>
    </Layout>
  );
}

function FindPatient() {
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
    <Layout title="Find Patient">
      <div style={{ maxWidth: 600 }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="section-title">🔍 Search Patient</p>
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, email or phone…" autoFocus />
        </div>
        {loading ? <div className="spinner" /> : patients.map(p => (
          <div key={p.id} className="card" style={{ marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(`/patients/${p.id}`)}>
            <div style={{ width: 44, height: 44, background: 'var(--primary-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👤</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700 }}>{p.medicalProfile?.first_name || '—'} {p.medicalProfile?.last_name || ''}</p>
              <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>{p.email || p.phone} · {p.account_type}</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/upload-report?patientId=${p.id}`); }}>Upload Report</button>
            <span style={{ color: 'var(--primary)', fontSize: 20 }}>›</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}

function PatientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    API.get(`/staff/patients/${id}`).then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, [id]);
  if (loading) return <Layout title="Patient"><div className="spinner" /></Layout>;
  if (!data) return <Layout title="Patient"><p>Not found</p></Layout>;
  const { profile, allergies, conditions, recentDocuments } = data;
  return (
    <Layout title={`${profile?.first_name || ''} ${profile?.last_name || ''}`}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
        <button className="btn btn-success" onClick={() => navigate(`/upload-report`)}>📤 Upload Report for this Patient</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <p className="section-title">Patient Info</p>
            {[['Name', `${profile?.first_name} ${profile?.last_name}`], ['DOB', profile?.date_of_birth], ['Gender', profile?.gender], ['Blood Group', profile?.blood_group]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{l}</span>
                <span style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>{v || '—'}</span>
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
        <div className="card">
          <p className="section-title">📄 Documents ({recentDocuments?.length || 0})</p>
          {!recentDocuments?.length ? <p style={{ color: 'var(--gray-400)' }}>No documents yet</p> :
            <div className="table-wrap">
              <table>
                <thead><tr><th>Title</th><th>Date</th><th>Category</th><th>AI</th><th>Actions</th></tr></thead>
                <tbody>
                  {recentDocuments.map(doc => (
                    <tr key={doc.id}>
                      <td><strong>{doc.title || doc.original_name}</strong></td>
                      <td>{doc.document_date}</td>
                      <td>{doc.category}</td>
                      <td>{doc.is_ai_analyzed ? <span className="badge badge-green">Done</span> : <span className="badge badge-yellow">Pending</span>}</td>
                      <td><a href={doc.file_path} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">View</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </Layout>
  );
}

function AllReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  useEffect(() => {
    setLoading(true);
    API.get('/staff/patients', { params: { limit: 50 } })
      .then(r => setReports(r.data.data?.patients || []))
      .finally(() => setLoading(false));
  }, []);
  return (
    <Layout title="All Reports">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <p className="section-title" style={{ marginBottom: 0 }}>Recently Active Patients</p>
          <input className="input" style={{ width: 260 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter…" />
        </div>
        {loading ? <div className="spinner" /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Patient</th><th>Contact</th><th>Account Type</th><th>Registered</th><th>Actions</th></tr></thead>
              <tbody>
                {reports.filter(p => !search || `${p.medicalProfile?.first_name} ${p.medicalProfile?.last_name} ${p.email} ${p.phone}`.toLowerCase().includes(search.toLowerCase())).map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.medicalProfile?.first_name || '—'} {p.medicalProfile?.last_name || ''}</strong></td>
                    <td>{p.email || p.phone}</td>
                    <td><span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{p.account_type}</span></td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <a href={`/patients/${p.id}`} className="btn btn-secondary btn-sm">View</a>
                      <a href={`/upload-report`} className="btn btn-success btn-sm">Upload</a>
                    </td>
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
          <Route path="/upload-report" element={<Guard><UploadReport /></Guard>} />
          <Route path="/patients" element={<Guard><FindPatient /></Guard>} />
          <Route path="/patients/:id" element={<Guard><PatientView /></Guard>} />
          <Route path="/reports" element={<Guard><AllReports /></Guard>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
