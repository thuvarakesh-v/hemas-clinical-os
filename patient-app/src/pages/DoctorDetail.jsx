import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctors as doctorsAPI, appointments as apptAPI, emergency } from '../services/api';

function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    doctorsAPI.getById(id).then(r => setDoctor(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  async function loadSlots(date) {
    setSelectedDate(date); setSelectedSlot(null); setSlotsLoading(true);
    try {
      const { data } = await apptAPI.getSlots(id, date);
      setSlots(data.data?.slots || []);
    } finally { setSlotsLoading(false); }
  }

  async function book() {
    if (!selectedDate || !selectedSlot) return;
    setBooking(true);
    try {
      await apptAPI.book({ doctorId: id, scheduledDate: selectedDate, scheduledTime: selectedSlot, reason });
      alert('✅ Appointment booked successfully!');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    } finally { setBooking(false); }
  }

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  if (!doctor) return <div className="page-center"><p>Doctor not found</p></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>
      <div style={{ background: '#fff', padding: '16px', display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', fontSize: 22, color: '#64748b' }}>‹</button>
        <h1 style={{ fontSize: 17, fontWeight: 700 }}>Doctor Profile</h1>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 70, height: 70, background: '#eff6ff', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>👨‍⚕️</div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Dr. {doctor.first_name} {doctor.last_name}</h2>
              <p style={{ color: '#2563eb', fontWeight: 600, fontSize: 14 }}>{doctor.specialization}</p>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{doctor.qualification}</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13 }}>⭐ <strong>{doctor.rating}</strong></span>
                <span style={{ fontSize: 13 }}>🕐 <strong>{doctor.experience_years}y</strong></span>
                <span style={{ fontSize: 13 }}>👥 <strong>{doctor.patient_count}</strong></span>
              </div>
              {doctor.consultation_fee > 0 && <p style={{ marginTop: 6, color: '#10b981', fontWeight: 700 }}>LKR {doctor.consultation_fee} / consultation</p>}
            </div>
          </div>
          {doctor.bio && <p style={{ marginTop: 14, fontSize: 14, color: '#334155', lineHeight: 1.6, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>{doctor.bio}</p>}
          {doctor.department && <div style={{ marginTop: 10 }}><span className="badge badge-blue">🏥 {doctor.department.name}</span></div>}
        </div>

        <div className="card">
          <p className="section-title">📅 Select Date</p>
          <input type="date" className="input" value={selectedDate} min={minDate} max={maxDate} onChange={e => loadSlots(e.target.value)} />
        </div>

        {selectedDate && (
          <div className="card">
            <p className="section-title">⏰ Available Slots</p>
            {slotsLoading ? <div className="spinner" /> :
              slots.length === 0 ? <p style={{ color: '#94a3b8', fontSize: 14 }}>No slots available for this date.</p> :
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {slots.map(slot => (
                  <button key={slot.time} onClick={() => !slot.booked && !slot.past && setSelectedSlot(slot.time)}
                    style={{ padding: '10px', borderRadius: 10, border: `2px solid ${selectedSlot === slot.time ? '#2563eb' : '#e2e8f0'}`, background: slot.booked || slot.past ? '#f1f5f9' : selectedSlot === slot.time ? '#eff6ff' : '#fff', color: slot.booked || slot.past ? '#94a3b8' : selectedSlot === slot.time ? '#2563eb' : '#334155', fontWeight: 600, fontSize: 13, cursor: slot.booked || slot.past ? 'not-allowed' : 'pointer', textDecoration: slot.booked || slot.past ? 'line-through' : 'none' }}>
                    {slot.time}
                  </button>
                ))}
              </div>
            }
          </div>
        )}

        {selectedSlot && (
          <div className="card">
            <p className="section-title">📝 Reason (Optional)</p>
            <textarea className="input" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Brief reason for the appointment…" />
            <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 14 }} onClick={book} disabled={booking}>
              {booking ? 'Booking…' : `✅ Confirm Appointment — ${selectedDate} at ${selectedSlot}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


export default DoctorDetail;
