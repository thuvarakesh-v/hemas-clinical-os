import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointments, documents } from '../services/api';

export default function Home() {
  const { user, profile } = useAuth();
  const [upcomingAppts, setUpcomingAppts] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return; // ProfileRoute handles redirect — just wait
    Promise.all([
      appointments.getMy({ upcoming: true }).catch(() => ({ data: { data: [] } })),
      documents.getAll({ limit: 3 }).catch(() => ({ data: { data: { docs: [] } } })),
    ]).then(([a, d]) => {
      setUpcomingAppts(a.data.data || []);
      setRecentDocs(d.data.data?.docs || []);
    }).finally(() => setLoading(false));
  }, [profile]);

  const name = profile ? `${profile.profile?.first_name || ''}` : user?.email?.split('@')[0] || 'Patient';
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1e40af,#3b82f6)', padding: '24px 16px 32px', color: '#fff' }}>
        <p style={{ fontSize: 13, opacity: 0.8 }}>{greeting} 👋</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>{name}</h1>
        <p style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>Here's your health overview</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Link to="/booking" style={{ flex: 1, background: 'rgba(255,255,255,.2)', borderRadius: 12, padding: '12px', textAlign: 'center', color: '#fff', fontWeight: 600, fontSize: 14, backdropFilter: 'blur(10px)' }}>
            📅 Book Appointment
          </Link>
          <Link to="/ai" style={{ flex: 1, background: 'rgba(255,255,255,.2)', borderRadius: 12, padding: '12px', textAlign: 'center', color: '#fff', fontWeight: 600, fontSize: 14, backdropFilter: 'blur(10px)' }}>
            🤖 AI Engine
          </Link>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: -16 }}>
        {/* Health Stats */}
        {profile?.profile && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 4px 20px rgba(0,0,0,.08)', marginBottom: 20 }}>
            <p className="section-title">Health Vitals</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Blood Group', value: profile.profile.blood_group, icon: '🩸' },
                { label: 'Heart Rate', value: `${profile.profile.normal_heart_rate_min}–${profile.profile.normal_heart_rate_max}`, icon: '💓' },
                { label: 'BP', value: `${profile.profile.normal_bp_systolic}/${profile.profile.normal_bp_diastolic}`, icon: '🩺' },
              ].map(s => (
                <div key={s.label} style={{ background: '#f8fafc', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Allergies & Conditions */}
        {profile && (profile.allergies?.length > 0 || profile.conditions?.length > 0) && (
          <div className="card" style={{ marginBottom: 20 }}>
            <p className="section-title">Active Health Alerts</p>
            {profile.allergies?.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>ALLERGIES</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {profile.allergies.slice(0, 5).map((a, i) => (
                    <span key={i} className="chip chip-danger">{a.custom_allergy || a.allergy?.name}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.conditions?.length > 0 && (
              <div>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>CONDITIONS</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {profile.conditions.slice(0, 5).map((c, i) => (
                    <span key={i} className="chip">{c.custom_condition || c.condition?.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upcoming Appointments */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p className="section-title" style={{ marginBottom: 0 }}>Upcoming Appointments</p>
            <Link to="/appointments" style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}>View All</Link>
          </div>
          {loading ? <div className="spinner" /> :
            upcomingAppts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                <p style={{ fontSize: 14 }}>No upcoming appointments</p>
                <Link to="/booking" className="btn btn-primary btn-sm" style={{ marginTop: 10 }}>Book Now</Link>
              </div>
            ) : (
              upcomingAppts.slice(0, 3).map(a => (
                <div key={a.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 44, height: 44, background: '#eff6ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🩺</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>Dr. {a.doctor?.first_name} {a.doctor?.last_name}</p>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{a.doctor?.specialization}</p>
                    <p style={{ fontSize: 12, color: '#2563eb', marginTop: 4, fontWeight: 600 }}>{a.scheduled_date} at {a.scheduled_time}</p>
                  </div>
                  <span className={`badge ${a.status === 'confirmed' ? 'badge-green' : 'badge-yellow'}`}>{a.status}</span>
                </div>
              ))
            )
          }
        </div>

        {/* Recent Documents */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p className="section-title" style={{ marginBottom: 0 }}>Recent Documents</p>
            <Link to="/vault" style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}>View All</Link>
          </div>
          {loading ? <div className="spinner" /> :
            recentDocs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 14 }}>
                No documents yet. Upload your first report.
              </div>
            ) : (
              recentDocs.map(doc => (
                <Link to="/vault" key={doc.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                  <div style={{ width: 38, height: 38, background: '#f1f5f9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📄</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{doc.title || doc.original_name}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>{doc.document_date} · {doc.category}</p>
                  </div>
                  {doc.is_ai_analyzed && <span className="badge badge-blue" style={{ fontSize: 10 }}>AI ✓</span>}
                </Link>
              ))
            )
          }
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { to: '/ai', icon: '🤖', label: 'AI Symptom Check', color: '#4f46e5', bg: '#eef2ff' },
            { to: '/vault', icon: '📋', label: 'Upload Report', color: '#0891b2', bg: '#ecfeff' },
            { to: '/appointments', icon: '📅', label: 'My Appointments', color: '#059669', bg: '#d1fae5' },
            { to: '/profile', icon: '👤', label: 'Edit Profile', color: '#d97706', bg: '#fef3c7' },
          ].map(a => (
            <Link key={a.to} to={a.to} style={{ background: a.bg, borderRadius: 14, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 26 }}>{a.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: a.color }}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
