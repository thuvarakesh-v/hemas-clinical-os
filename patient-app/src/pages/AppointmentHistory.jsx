import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointments as apptAPI } from '../services/api';

const STATUS_STYLE = {
  confirmed: { bg: '#d1fae5', color: '#065f46', label: 'Confirmed' },
  pending:   { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  completed: { bg: '#dbeafe', color: '#1d4ed8', label: 'Completed' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
  no_show:   { bg: '#f3f4f6', color: '#6b7280', label: 'No Show' },
};

export default function AppointmentHistory() {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await apptAPI.getMy();
      setAppts(data.data || []);
    } finally { setLoading(false); }
  }

  async function cancel(id) {
    if (!confirm('Cancel this appointment?')) return;
    setCancelling(id);
    try {
      await apptAPI.cancel(id, { reason: 'Cancelled by patient' });
      setAppts(a => a.map(ap => ap.id === id ? { ...ap, status: 'cancelled' } : ap));
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed');
    } finally { setCancelling(null); }
  }

  const filtered = filter === 'all' ? appts : appts.filter(a => a.status === filter);
  const upcoming = appts.filter(a => ['confirmed', 'pending'].includes(a.status) && a.scheduled_date >= new Date().toISOString().split('T')[0]);

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ background: '#fff', padding: '20px 16px 0', borderBottom: '1px solid #f1f5f9' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>📅 My Appointments</h1>
        {upcoming.length > 0 && (
          <div style={{ background: '#eff6ff', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 20 }}>🔔</span>
            <p style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 600 }}>
              You have {upcoming.length} upcoming appointment{upcoming.length > 1 ? 's' : ''}.
            </p>
          </div>
        )}
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, paddingBottom: 0, overflowX: 'auto' }}>
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '8px 16px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: filter === f ? '#2563eb' : 'transparent', color: filter === f ? '#fff' : '#64748b', textTransform: 'capitalize', whiteSpace: 'nowrap', borderBottom: filter === f ? 'none' : '2px solid transparent' }}>
              {f} {f === 'all' ? `(${appts.length})` : `(${appts.filter(a => a.status === f).length})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {loading ? (
          <div className="page-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No appointments found</p>
            <Link to="/booking" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Book an Appointment</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(a => {
              const s = STATUS_STYLE[a.status] || STATUS_STYLE.pending;
              const isPast = a.scheduled_date < new Date().toISOString().split('T')[0];
              const canCancel = ['confirmed', 'pending'].includes(a.status) && !isPast;

              return (
                <div key={a.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Top bar */}
                  <div style={{ background: s.bg, padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.color, textTransform: 'uppercase' }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{a.scheduled_date}</span>
                  </div>

                  <div style={{ padding: '14px 16px', display: 'flex', gap: 14 }}>
                    {/* Time block */}
                    <div style={{ background: '#f8fafc', borderRadius: 12, padding: '10px 14px', textAlign: 'center', minWidth: 64, flexShrink: 0 }}>
                      <p style={{ fontWeight: 800, fontSize: 18, color: '#2563eb' }}>{a.scheduled_time}</p>
                      <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{a.duration_minutes}min</p>
                    </div>

                    {/* Doctor info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 15 }}>
                            Dr. {a.doctor?.first_name} {a.doctor?.last_name}
                          </p>
                          <p style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, marginTop: 2 }}>
                            {a.doctor?.specialization}
                          </p>
                          {a.doctor?.department?.name && (
                            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                              🏥 {a.doctor.department.name}
                            </p>
                          )}
                        </div>
                        {a.is_online && (
                          <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
                            💻 Online
                          </span>
                        )}
                      </div>

                      {a.reason && (
                        <div style={{ marginTop: 10, background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>
                          <p style={{ fontSize: 12, color: '#64748b' }}>📋 <strong>Reason:</strong> {a.reason}</p>
                        </div>
                      )}

                      {a.doctor_notes && (
                        <div style={{ marginTop: 8, background: '#eff6ff', borderRadius: 8, padding: '8px 12px' }}>
                          <p style={{ fontSize: 12, color: '#1d4ed8' }}>👨‍⚕️ <strong>Doctor's Notes:</strong> {a.doctor_notes}</p>
                        </div>
                      )}

                      {a.prescription && (
                        <div style={{ marginTop: 8, background: '#f0fdf4', borderRadius: 8, padding: '8px 12px' }}>
                          <p style={{ fontSize: 12, color: '#065f46', fontWeight: 700, marginBottom: 4 }}>💊 Prescription:</p>
                          {Array.isArray(a.prescription)
                            ? a.prescription.map((rx, i) => <p key={i} style={{ fontSize: 12, color: '#047857' }}>• {rx.medication || JSON.stringify(rx)}</p>)
                            : <p style={{ fontSize: 12, color: '#047857' }}>{JSON.stringify(a.prescription)}</p>
                          }
                        </div>
                      )}

                      {canCancel && (
                        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => cancel(a.id)}
                            disabled={cancelling === a.id}
                            style={{ padding: '6px 14px', borderRadius: 8, background: '#fee2e2', color: '#ef4444', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            {cancelling === a.id ? 'Cancelling…' : '✕ Cancel Appointment'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Link to="/booking" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', background: '#2563eb', color: '#fff', borderRadius: 14, fontWeight: 700, marginTop: 16, textDecoration: 'none' }}>
          📅 Book New Appointment
        </Link>
      </div>
    </div>
  );
}
