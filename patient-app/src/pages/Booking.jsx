// Booking.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctors as doctorsAPI, master } from '../services/api';

export default function Booking() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [depts, setDepts] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { master.getDepartments().then(r => setDepts(r.data.data || [])); }, []);
  useEffect(() => { fetchDoctors(); }, [search, deptFilter]);

  async function fetchDoctors() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (deptFilter) params.departmentId = deptFilter;
      const { data } = await doctorsAPI.getAll(params);
      setDoctorsList(data.data?.doctors || []);
    } finally { setLoading(false); }
  }

  return (
    <div className="page-content">
      <div style={{ padding: '20px 16px 0', background: '#fff' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>🏥 Find a Doctor</h1>
        <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search doctor, specialty, illness…" style={{ marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12 }}>
          <button onClick={() => setDeptFilter('')} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: !deptFilter ? '#2563eb' : '#f1f5f9', color: !deptFilter ? '#fff' : '#64748b', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>All</button>
          {depts.map(d => (
            <button key={d.id} onClick={() => setDeptFilter(d.id)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: deptFilter === d.id ? '#2563eb' : '#f1f5f9', color: deptFilter === d.id ? '#fff' : '#64748b', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>{d.name}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px' }}>
        {loading ? <div className="page-center"><div className="spinner" /></div> :
          doctorsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <p>No doctors found. Try a different search.</p>
            </div>
          ) : doctorsList.map(doc => (
            <Link to={`/doctors/${doc.id}`} key={doc.id} className="card" style={{ marginBottom: 12, display: 'block', textDecoration: 'none' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 52, height: 52, background: '#eff6ff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>👨‍⚕️</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Dr. {doc.first_name} {doc.last_name}</p>
                  <p style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, marginTop: 2 }}>{doc.specialization}</p>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{doc.qualification}</p>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>⭐ {doc.rating || 0}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>🕐 {doc.experience_years}y exp</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>👥 {doc.patient_count} patients</span>
                    {doc.consultation_fee > 0 && <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>LKR {doc.consultation_fee}</span>}
                  </div>
                </div>
                <span style={{ fontSize: 20, color: '#2563eb' }}>›</span>
              </div>
            </Link>
          ))
        }
      </div>
    </div>
  );
}
