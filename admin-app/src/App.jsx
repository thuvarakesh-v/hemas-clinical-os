import { useState, useEffect, createContext, useContext } from 'react';
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
      if (data.data.role !== 'admin') throw new Error('Admin access required');
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('user', JSON.stringify({ ...data.data.user, role: 'admin' }));
      setUser({ ...data.data.user, role: 'admin' });
    }
  }
  function logout() { localStorage.clear(); setUser(null); }
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}
const useAuth = () => useContext(Ctx);

// ─── Modal ────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><h2>{title}</h2><button onClick={onClose}>×</button></div>
        {children}
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  function show(msg, type = 'success') { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }
  const Toast = toast ? <div style={{ position: 'fixed', top: 20, right: 20, padding: '12px 20px', borderRadius: 10, background: toast.type === 'success' ? 'var(--success)' : 'var(--danger)', color: '#fff', zIndex: 9999, fontWeight: 600, boxShadow: 'var(--shadow-md)' }}>{toast.msg}</div> : null;
  return { show, Toast };
}

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/users', label: 'Patients', icon: '👥' },
    { to: '/doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { to: '/staff', label: 'Staff', icon: '👷' },
    { to: '/departments', label: 'Departments', icon: '🏥' },
    { to: '/appointments', label: 'Appointments', icon: '📅' },
    { to: '/master-data', label: 'Master Data', icon: '📋' },
    { to: '/admins', label: 'Admins', icon: '🔐' },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo"><span>⚙️</span><div><h2>MediCare AI</h2><p>Admin Control Panel</p></div></div>
      <nav className="sidebar-nav">{links.map(l => <NavLink key={l.to} to={l.to} end={l.to === '/'}>{l.icon} {l.label}</NavLink>)}</nav>
      <div className="sidebar-user">
        <p style={{ fontWeight: 600, fontSize: 13 }}>{user?.first_name} {user?.last_name}</p>
        <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{user?.is_super_admin ? '⭐ Super Admin' : 'Admin'}</p>
        <button className="btn btn-secondary btn-sm" style={{ marginTop: 8, width: '100%' }} onClick={() => { logout(); navigate('/login'); }}>Sign Out</button>
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
          {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
        </div>
        <div className="page">{children}</div>
      </main>
    </div>
  );
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
      <div className="card" style={{ width: 380, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}><div style={{ fontSize: 36, marginBottom: 8 }}>⚙️</div><h1 style={{ fontSize: 20, fontWeight: 700 }}>Admin Control Panel</h1><p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 4 }}>Authorized access only</p></div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group"><label>Username</label><input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required /></div>
          <div className="input-group"><label>Password</label><input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required /></div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-lg" style={{ background: '#312e81' }} disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { API.get('/admin/dashboard').then(r => setStats(r.data.data?.stats)); }, []);
  const cards = stats ? [
    { label: 'Total Patients', value: stats.users, icon: '👥', color: '#2563eb', bg: '#dbeafe' },
    { label: 'Active Doctors', value: stats.doctors, icon: '👨‍⚕️', color: '#7c3aed', bg: '#ede9fe' },
    { label: 'Staff Members', value: stats.staff, icon: '👷', color: '#0891b2', bg: '#cffafe' },
    { label: 'Total Appointments', value: stats.appointments, icon: '📅', color: '#d97706', bg: '#fef3c7' },
    { label: "Today's Appointments", value: stats.todayAppointments, icon: '📌', color: '#dc2626', bg: '#fee2e2' },
    { label: 'Pending Appointments', value: stats.pendingAppointments, icon: '⏳', color: '#9333ea', bg: '#f3e8ff' },
    { label: 'Total Documents', value: stats.documents, icon: '📄', color: '#059669', bg: '#d1fae5' },
    { label: 'New Patients (7d)', value: stats.newUsersThisWeek, icon: '✨', color: '#f59e0b', bg: '#fef3c7' },
  ] : [];
  return (
    <Layout title="Dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.label} className="stat-card">
            <div className="icon" style={{ background: c.bg }}>{c.icon}</div>
            <div><div className="value" style={{ color: c.color }}>{c.value ?? '…'}</div><div className="label">{c.label}</div></div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {[
          { to: '/doctors', icon: '➕', label: 'Add New Doctor', color: '#7c3aed' },
          { to: '/staff', icon: '➕', label: 'Add New Staff', color: '#2563eb' },
          { to: '/departments', icon: '🏥', label: 'Manage Departments', color: '#059669' },
          { to: '/master-data', icon: '📋', label: 'Manage Allergies & Conditions', color: '#d97706' },
        ].map(a => (
          <a key={a.to} href={a.to} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '20px', display: 'flex', gap: 14, alignItems: 'center', boxShadow: 'var(--shadow)', textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{a.icon}</div>
            <p style={{ fontWeight: 700, color: a.color }}>{a.label}</p>
          </a>
        ))}
      </div>
    </Layout>
  );
}

// ─── Generic CRUD Table ───────────────────────────────────────
function CRUDPage({ title, icon, apiPath, columns, renderForm, itemLabel = 'Item' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { show, Toast } = useToast();
  const LIMIT = 15;

  async function load() {
    setLoading(true);
    try {
      const r = await API.get(`/admin/${apiPath}`, { params: { search, page, limit: LIMIT } });
      const d = r.data.data;
      if (d.pagination) { setItems(d[apiPath] || d.doctors || d.staff || d.users || d.appointments || []); setTotal(d.pagination.total); }
      else setItems(d || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search, page]);

  async function handleDelete(id) {
    if (!confirm(`Delete this ${itemLabel}?`)) return;
    try { await API.delete(`/admin/${apiPath}/${id}`); show(`${itemLabel} deleted`); load(); }
    catch { show('Delete failed', 'error'); }
  }

  async function handleToggle(id) {
    try { await API.put(`/admin/users/${id}/toggle-status`); show('Status updated'); load(); }
    catch { show('Update failed', 'error'); }
  }

  return (
    <Layout title={`${icon} ${title}`} actions={
      renderForm ? <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowModal(true); }}>+ Add {itemLabel}</button> : null
    }>
      {Toast}
      <div className="flex gap-3 mb-4 items-center">
        <div className="search-bar flex-1" style={{ maxWidth: 360 }}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input className="input" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={`Search ${title.toLowerCase()}…`} />
        </div>
        <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>{total} total</span>
      </div>
      <div className="card">
        {loading ? <div className="spinner" /> : items.length === 0 ? (
          <div className="empty-state"><div className="icon">{icon}</div><p>No {title.toLowerCase()} found</p></div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}<th>Actions</th></tr></thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      {columns.map(c => <td key={c.key}>{c.render ? c.render(item) : item[c.key] ?? '—'}</td>)}
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {renderForm && <button className="btn btn-secondary btn-sm" onClick={() => { setEditItem(item); setShowModal(true); }}>Edit</button>}
                          {apiPath === 'users' && <button className="btn btn-sm" style={{ background: item.is_active ? '#fee2e2' : '#d1fae5', color: item.is_active ? '#ef4444' : '#10b981' }} onClick={() => handleToggle(item.id)}>{item.is_active ? 'Disable' : 'Enable'}</button>}
                          {apiPath !== 'users' && apiPath !== 'appointments' && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Remove</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {total > LIMIT && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span style={{ padding: '6px 12px', fontSize: 13 }}>Page {page} of {Math.ceil(total / LIMIT)}</span>
                <button className="btn btn-secondary btn-sm" disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
      {showModal && renderForm && (
        <Modal title={editItem ? `Edit ${itemLabel}` : `Add ${itemLabel}`} onClose={() => setShowModal(false)}>
          {renderForm({ item: editItem, onSuccess: () => { setShowModal(false); load(); show(`${itemLabel} ${editItem ? 'updated' : 'created'}`); }, onError: (msg) => show(msg, 'error') })}
        </Modal>
      )}
    </Layout>
  );
}

// ─── Doctors page ─────────────────────────────────────────────
function DoctorForm({ item, onSuccess, onError }) {
  const [form, setForm] = useState({ username: '', password: '', email: '', firstName: item?.first_name || '', lastName: item?.last_name || '', phone: item?.phone || '', qualification: item?.qualification || '', specialization: item?.specialization || '', experienceYears: item?.experience_years || 0, consultationFee: item?.consultation_fee || 0, bio: item?.bio || '', slotStartTime: item?.slot_start_time || '09:00', slotEndTime: item?.slot_end_time || '17:00', slotDurationMinutes: item?.slot_duration_minutes || 30, isActive: item?.is_active !== false });
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault(); setLoading(true);
    try {
      if (item) await API.put(`/admin/doctors/${item.id}`, form);
      else await API.post('/admin/doctors', form);
      onSuccess();
    } catch (err) { onError(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  }
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {!item && <><div className="grid-2"><div className="input-group"><label>Username *</label><input className="input" value={form.username} onChange={set('username')} required /></div><div className="input-group"><label>Password *</label><input className="input" type="password" value={form.password} onChange={set('password')} required /></div></div><div className="input-group"><label>Email *</label><input className="input" type="email" value={form.email} onChange={set('email')} required /></div></>}
      <div className="grid-2"><div className="input-group"><label>First Name *</label><input className="input" value={form.firstName} onChange={set('firstName')} required /></div><div className="input-group"><label>Last Name *</label><input className="input" value={form.lastName} onChange={set('lastName')} required /></div></div>
      <div className="grid-2"><div className="input-group"><label>Specialization</label><input className="input" value={form.specialization} onChange={set('specialization')} /></div><div className="input-group"><label>Qualification</label><input className="input" value={form.qualification} onChange={set('qualification')} /></div></div>
      <div className="grid-2"><div className="input-group"><label>Experience (years)</label><input className="input" type="number" value={form.experienceYears} onChange={set('experienceYears')} /></div><div className="input-group"><label>Fee (LKR)</label><input className="input" type="number" value={form.consultationFee} onChange={set('consultationFee')} /></div></div>
      <div className="grid-3"><div className="input-group"><label>Start Time</label><input className="input" type="time" value={form.slotStartTime} onChange={set('slotStartTime')} /></div><div className="input-group"><label>End Time</label><input className="input" type="time" value={form.slotEndTime} onChange={set('slotEndTime')} /></div><div className="input-group"><label>Slot (mins)</label><input className="input" type="number" value={form.slotDurationMinutes} onChange={set('slotDurationMinutes')} /></div></div>
      <div className="input-group"><label>Bio</label><textarea className="input" rows={3} value={form.bio} onChange={set('bio')} /></div>
      {item && <div className="input-group"><label><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Active</label></div>}
      <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Saving…' : 'Save Doctor'}</button>
    </form>
  );
}

function Doctors() {
  const [depts, setDepts] = useState([]);
  useEffect(() => { API.get('/admin/departments').then(r => setDepts(r.data.data || [])); }, []);
  return (
    <CRUDPage title="Doctors" icon="👨‍⚕️" apiPath="doctors" itemLabel="Doctor"
      columns={[
        { key: 'name', label: 'Name', render: d => <><strong>Dr. {d.first_name} {d.last_name}</strong><br/><span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{d.email}</span></> },
        { key: 'specialization', label: 'Specialization' },
        { key: 'department', label: 'Department', render: d => d.department?.name || '—' },
        { key: 'experience_years', label: 'Exp.', render: d => `${d.experience_years}y` },
        { key: 'rating', label: 'Rating', render: d => `⭐ ${d.rating}` },
        { key: 'is_active', label: 'Status', render: d => <span className={`badge badge-${d.is_active ? 'green' : 'red'}`}>{d.is_active ? 'Active' : 'Inactive'}</span> },
      ]}
      renderForm={({ item, onSuccess, onError }) => <DoctorForm item={item} onSuccess={onSuccess} onError={onError} />}
    />
  );
}

// ─── Staff page ────────────────────────────────────────────────
function StaffForm({ item, onSuccess, onError }) {
  const [form, setForm] = useState({ username: '', password: '', email: '', firstName: item?.first_name || '', lastName: item?.last_name || '', phone: item?.phone || '', role: item?.role || 'medical_staff', employeeId: item?.employee_id || '', isActive: item?.is_active !== false });
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault(); setLoading(true);
    try {
      if (item) await API.put(`/admin/staff/${item.id}`, form);
      else await API.post('/admin/staff', form);
      onSuccess();
    } catch (err) { onError(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  }
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {!item && <><div className="grid-2"><div className="input-group"><label>Username *</label><input className="input" value={form.username} onChange={set('username')} required /></div><div className="input-group"><label>Password *</label><input className="input" type="password" value={form.password} onChange={set('password')} required /></div></div><div className="input-group"><label>Email *</label><input className="input" type="email" value={form.email} onChange={set('email')} required /></div></>}
      <div className="grid-2"><div className="input-group"><label>First Name *</label><input className="input" value={form.firstName} onChange={set('firstName')} required /></div><div className="input-group"><label>Last Name *</label><input className="input" value={form.lastName} onChange={set('lastName')} required /></div></div>
      <div className="grid-2">
        <div className="input-group"><label>Role *</label><select className="input" value={form.role} onChange={set('role')}>{['medical_staff','medicine_staff','nurse','receptionist','lab_technician'].map(r => <option key={r} value={r}>{r.replace('_',' ')}</option>)}</select></div>
        <div className="input-group"><label>Employee ID</label><input className="input" value={form.employeeId} onChange={set('employeeId')} /></div>
      </div>
      <div className="input-group"><label>Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
      {item && <div className="input-group"><label><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Active</label></div>}
      <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Saving…' : 'Save Staff'}</button>
    </form>
  );
}

function Staff() {
  return (
    <CRUDPage title="Staff" icon="👷" apiPath="staff" itemLabel="Staff Member"
      columns={[
        { key: 'name', label: 'Name', render: s => <><strong>{s.first_name} {s.last_name}</strong><br/><span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{s.email}</span></> },
        { key: 'role', label: 'Role', render: s => <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{s.role?.replace('_',' ')}</span> },
        { key: 'employee_id', label: 'Emp. ID' },
        { key: 'department', label: 'Department', render: s => s.department?.name || '—' },
        { key: 'is_active', label: 'Status', render: s => <span className={`badge badge-${s.is_active ? 'green' : 'red'}`}>{s.is_active ? 'Active' : 'Inactive'}</span> },
      ]}
      renderForm={({ item, onSuccess, onError }) => <StaffForm item={item} onSuccess={onSuccess} onError={onError} />}
    />
  );
}

// ─── Departments ───────────────────────────────────────────────
function DeptForm({ item, onSuccess, onError }) {
  const [form, setForm] = useState({ name: item?.name || '', description: item?.description || '', icon: item?.icon || '' });
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault(); setLoading(true);
    try {
      if (item) await API.put(`/admin/departments/${item.id}`, form);
      else await API.post('/admin/departments', form);
      onSuccess();
    } catch (err) { onError(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  }
  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="input-group"><label>Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
      <div className="input-group"><label>Description</label><textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
      <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Saving…' : 'Save Department'}</button>
    </form>
  );
}

function Departments() {
  return (
    <CRUDPage title="Departments" icon="🏥" apiPath="departments" itemLabel="Department"
      columns={[
        { key: 'name', label: 'Department Name', render: d => <strong>{d.name}</strong> },
        { key: 'description', label: 'Description' },
        { key: 'is_active', label: 'Status', render: d => <span className={`badge badge-${d.is_active !== false ? 'green' : 'red'}`}>{d.is_active !== false ? 'Active' : 'Inactive'}</span> },
      ]}
      renderForm={({ item, onSuccess, onError }) => <DeptForm item={item} onSuccess={onSuccess} onError={onError} />}
    />
  );
}

// ─── Users ────────────────────────────────────────────────────
function Users() {
  return (
    <CRUDPage title="Patients" icon="👥" apiPath="users" itemLabel="Patient"
      columns={[
        { key: 'name', label: 'Name', render: u => <><strong>{u.medicalProfile?.first_name || '—'} {u.medicalProfile?.last_name || ''}</strong><br/><span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{u.email || u.phone}</span></> },
        { key: 'account_type', label: 'Type', render: u => <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{u.account_type}</span> },
        { key: 'verified', label: 'Verified', render: u => u.is_email_verified || u.is_phone_verified ? <span className="badge badge-green">✓</span> : <span className="badge badge-red">✗</span> },
        { key: 'created_at', label: 'Registered', render: u => new Date(u.created_at).toLocaleDateString() },
        { key: 'is_active', label: 'Status', render: u => <span className={`badge badge-${u.is_active ? 'green' : 'red'}`}>{u.is_active ? 'Active' : 'Disabled'}</span> },
      ]}
      renderForm={null}
    />
  );
}

// ─── Appointments ──────────────────────────────────────────────
function Appointments() {
  return (
    <CRUDPage title="Appointments" icon="📅" apiPath="appointments" itemLabel="Appointment"
      columns={[
        { key: 'patient', label: 'Patient', render: a => `${a.patient?.medicalProfile?.first_name || '—'} ${a.patient?.medicalProfile?.last_name || ''}` },
        { key: 'doctor', label: 'Doctor', render: a => `Dr. ${a.doctor?.first_name || ''} ${a.doctor?.last_name || ''}` },
        { key: 'scheduled_date', label: 'Date' },
        { key: 'scheduled_time', label: 'Time' },
        { key: 'status', label: 'Status', render: a => <span className={`badge badge-${a.status === 'confirmed' ? 'green' : a.status === 'completed' ? 'blue' : a.status === 'cancelled' ? 'red' : 'yellow'}`}>{a.status}</span> },
      ]}
      renderForm={null}
    />
  );
}

// ─── Master Data ───────────────────────────────────────────────
function MasterData() {
  const [tab, setTab] = useState('allergies');
  const [allergies, setAllergies] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('other');
  const [loading, setLoading] = useState(false);
  const { show, Toast } = useToast();

  useEffect(() => {
    API.get('/admin/allergies').then(r => setAllergies(r.data.data || []));
    API.get('/admin/conditions').then(r => setConditions(r.data.data || []));
  }, []);

  async function add() {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      if (tab === 'allergies') { const r = await API.post('/admin/allergies', { name: newName, category: newCat }); setAllergies(a => [...a, r.data.data]); }
      else { const r = await API.post('/admin/conditions', { name: newName, category: newCat }); setConditions(c => [...c, r.data.data]); }
      setNewName(''); show('Added successfully');
    } catch (err) { show(err.response?.data?.message || 'Error', 'error'); }
    finally { setLoading(false); }
  }

  const list = tab === 'allergies' ? allergies : conditions;
  return (
    <Layout title="📋 Master Data">
      {Toast}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: '#fff', padding: 6, borderRadius: 10, width: 'fit-content', boxShadow: 'var(--shadow)' }}>
        {['allergies', 'conditions'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 20px', borderRadius: 8, fontWeight: 600, fontSize: 13, background: tab === t ? 'var(--primary)' : 'transparent', color: tab === t ? '#fff' : 'var(--gray-500)', transition: 'all .2s' }}>
            {t === 'allergies' ? '⚠️ Allergies' : '🏥 Conditions'} ({(tab === 'allergies' ? allergies : conditions).length})
          </button>
        ))}
      </div>
      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div className="input-group" style={{ flex: 2 }}><label>Name *</label><input className="input" value={newName} onChange={e => setNewName(e.target.value)} placeholder={`New ${tab === 'allergies' ? 'allergy' : 'condition'} name`} /></div>
        <div className="input-group" style={{ flex: 1 }}><label>Category</label><input className="input" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Category" /></div>
        <button className="btn btn-primary" onClick={add} disabled={loading}>+ Add</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Category</th>{tab === 'conditions' && <th>ICD Code</th>}</tr></thead>
            <tbody>
              {list.map((item, i) => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--gray-400)' }}>{i + 1}</td>
                  <td><strong>{item.name}</strong></td>
                  <td><span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{item.category}</span></td>
                  {tab === 'conditions' && <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{item.icd_code || '—'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

// ─── Admins ────────────────────────────────────────────────────
function Admins() {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', email: '', firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);
  const { show, Toast } = useToast();
  const { user } = useAuth();

  useEffect(() => { API.get('/admin/admins').then(r => setAdmins(r.data.data || [])); }, []);

  async function create(e) {
    e.preventDefault(); setLoading(true);
    try {
      const r = await API.post('/admin/admins', form);
      setAdmins(a => [...a, r.data.data]);
      setShowForm(false); show('Admin created');
    } catch (err) { show(err.response?.data?.message || 'Error', 'error'); }
    finally { setLoading(false); }
  }

  return (
    <Layout title="🔐 Admins" actions={user?.is_super_admin ? [<button key="add" className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Admin</button>] : []}>
      {Toast}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Super Admin</th><th>Status</th></tr></thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.first_name} {a.last_name}</strong></td>
                  <td style={{ fontFamily: 'monospace' }}>{a.username}</td>
                  <td>{a.email}</td>
                  <td>{a.is_super_admin ? <span className="badge badge-yellow">⭐ Super Admin</span> : <span className="badge badge-gray">Admin</span>}</td>
                  <td><span className={`badge badge-${a.is_active ? 'green' : 'red'}`}>{a.is_active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showForm && (
        <Modal title="Add Admin" onClose={() => setShowForm(false)}>
          <form onSubmit={create} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="grid-2"><div className="input-group"><label>Username *</label><input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required /></div><div className="input-group"><label>Password *</label><input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required /></div></div>
            <div className="input-group"><label>Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
            <div className="grid-2"><div className="input-group"><label>First Name *</label><input className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required /></div><div className="input-group"><label>Last Name *</label><input className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required /></div></div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Creating…' : 'Create Admin'}</button>
          </form>
        </Modal>
      )}
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
          <Route path="/users" element={<Guard><Users /></Guard>} />
          <Route path="/doctors" element={<Guard><Doctors /></Guard>} />
          <Route path="/staff" element={<Guard><Staff /></Guard>} />
          <Route path="/departments" element={<Guard><Departments /></Guard>} />
          <Route path="/appointments" element={<Guard><Appointments /></Guard>} />
          <Route path="/master-data" element={<Guard><MasterData /></Guard>} />
          <Route path="/admins" element={<Guard><Admins /></Guard>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
