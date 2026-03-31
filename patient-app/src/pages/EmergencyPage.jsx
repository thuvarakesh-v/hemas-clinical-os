import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { emergency } from '../services/api';

export default function EmergencyPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    emergency.getData(token)
      .then(r => setData(r.data.data))
      .catch(() => setError('Emergency data not found or QR is invalid.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <p style={{ color: '#ef4444', textAlign: 'center' }}>⚠️ {error}</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fef2f2', padding: 16 }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ background: '#dc2626', color: '#fff', padding: '20px', borderRadius: '20px 20px 0 0', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🆘</div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>EMERGENCY HEALTH INFO</h1>
          <p style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>For authorized medical personnel only</p>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: '0 0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ borderBottom: '2px solid #fee2e2', paddingBottom: 12 }}>
            <p style={{ fontWeight: 800, fontSize: 22, color: '#0f172a' }}>{data.name}</p>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 2 }}>{data.dateOfBirth && `Born: ${data.dateOfBirth}`} {data.gender && `· ${data.gender.toUpperCase()}`}</p>
          </div>

          <div style={{ background: '#fee2e2', padding: 14, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>🩸</span>
            <div>
              <p style={{ fontSize: 12, color: '#991b1b' }}>BLOOD GROUP</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#dc2626' }}>{data.bloodGroup}</p>
            </div>
          </div>

          {data.allergies?.length > 0 && (
            <div style={{ background: '#fff7ed', border: '2px solid #fed7aa', borderRadius: 12, padding: 14 }}>
              <p style={{ fontWeight: 800, color: '#c2410c', fontSize: 14, marginBottom: 10 }}>⚠️ KNOWN ALLERGIES — CRITICAL</p>
              {data.allergies.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, background: '#ef4444', borderRadius: 99, flexShrink: 0 }} />
                  <p style={{ fontWeight: 700, color: '#7c2d12' }}>{a.name}</p>
                  {a.severity && <span style={{ background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{a.severity}</span>}
                </div>
              ))}
            </div>
          )}

          {data.conditions?.length > 0 && (
            <div style={{ background: '#f0f9ff', border: '2px solid #bae6fd', borderRadius: 12, padding: 14 }}>
              <p style={{ fontWeight: 800, color: '#075985', fontSize: 14, marginBottom: 10 }}>🏥 ACTIVE CONDITIONS</p>
              {data.conditions.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, background: '#0ea5e9', borderRadius: 99, flexShrink: 0 }} />
                  <p style={{ fontWeight: 600, color: '#0c4a6e' }}>{c.name}</p>
                </div>
              ))}
            </div>
          )}

          {data.currentMedications?.length > 0 && (
            <div style={{ background: '#f5f3ff', border: '2px solid #ddd6fe', borderRadius: 12, padding: 14 }}>
              <p style={{ fontWeight: 800, color: '#5b21b6', fontSize: 14, marginBottom: 10 }}>💊 CURRENT MEDICATIONS</p>
              {data.currentMedications.map((m, i) => (
                <p key={i} style={{ color: '#4c1d95', fontWeight: 600, marginBottom: 4 }}>• {m}</p>
              ))}
            </div>
          )}

          {data.pastSurgeries?.length > 0 && (
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>🔪 Past Surgeries</p>
              {data.pastSurgeries.map((s, i) => <p key={i} style={{ fontSize: 13, color: '#334155', marginBottom: 4 }}>• {s}</p>)}
            </div>
          )}

          {data.emergencyContact && (data.emergencyContact.name || data.emergencyContact.phone) && (
            <div style={{ background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: 12, padding: 14 }}>
              <p style={{ fontWeight: 800, color: '#065f46', fontSize: 14, marginBottom: 8 }}>📞 EMERGENCY CONTACT</p>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{data.emergencyContact.name}</p>
              <a href={`tel:${data.emergencyContact.phone}`} style={{ color: '#059669', fontSize: 16, fontWeight: 700 }}>{data.emergencyContact.phone}</a>
              {data.emergencyContact.relation && <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{data.emergencyContact.relation}</p>}
            </div>
          )}

          {data.notes && (
            <div style={{ background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
              <p style={{ fontWeight: 700, fontSize: 12, color: '#64748b', marginBottom: 4 }}>ADDITIONAL NOTES</p>
              <p style={{ fontSize: 13, color: '#334155' }}>{data.notes}</p>
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>MediCare AI Hospital System — Emergency Access</p>
        </div>
      </div>
    </div>
  );
}
