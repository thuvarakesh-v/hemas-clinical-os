import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patient as patientAPI, master } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'];
const STEP_TITLES = ['Personal Info', 'Medical Details', 'Health Data & PIN', 'Emergency QR'];

export default function SetupProfile() {
  const navigate = useNavigate();
  const { loadProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [masterAllergies, setMasterAllergies] = useState([]);
  const [masterConditions, setMasterConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrData, setQrData] = useState(null);

  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: '', nic: '',
    bloodGroup: 'Unknown', heightCm: '', weightKg: '',
    normalHeartRateMin: 60, normalHeartRateMax: 100,
    normalBpSystolic: 120, normalBpDiastolic: 80,
    normalTemperature: 37.0, normalOxygenSaturation: 98,
    emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
    selectedAllergies: [], customAllergy: '',
    selectedConditions: [], customCondition: '',
    pastSurgeries: '', currentMedications: '', emergencyNotes: '',
    pin: '', confirmPin: '',
  });

  useEffect(() => {
    master.getAllergies().then(r => setMasterAllergies(r.data.data || []));
    master.getConditions().then(r => setMasterConditions(r.data.data || []));
  }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  function toggleAllergy(id, name) {
    setForm(f => {
      const exists = f.selectedAllergies.find(a => a.allergyId === id);
      return {
        ...f,
        selectedAllergies: exists
          ? f.selectedAllergies.filter(a => a.allergyId !== id)
          : [...f.selectedAllergies, { allergyId: id, name, severity: 'moderate' }],
      };
    });
  }

  function addCustomAllergy() {
    if (!form.customAllergy.trim()) return;
    setForm(f => ({
      ...f,
      selectedAllergies: [...f.selectedAllergies, { name: f.customAllergy.trim(), severity: 'moderate' }],
      customAllergy: '',
    }));
  }

  function toggleCondition(id, name) {
    setForm(f => {
      const exists = f.selectedConditions.find(c => c.conditionId === id);
      return {
        ...f,
        selectedConditions: exists
          ? f.selectedConditions.filter(c => c.conditionId !== id)
          : [...f.selectedConditions, { conditionId: id, name }],
      };
    });
  }

  function addCustomCondition() {
    if (!form.customCondition.trim()) return;
    setForm(f => ({
      ...f,
      selectedConditions: [...f.selectedConditions, { name: f.customCondition.trim() }],
      customCondition: '',
    }));
  }

  async function handleSubmit() {
    setError('');
    if (form.pin && form.pin !== form.confirmPin) return setError('PINs do not match');
    if (form.pin && (form.pin.length < 4 || form.pin.length > 6)) return setError('PIN must be 4–6 digits');
    setLoading(true);
    try {
      const { data } = await patientAPI.createProfile({
        firstName: form.firstName, lastName: form.lastName,
        dateOfBirth: form.dateOfBirth, gender: form.gender, nic: form.nic,
        bloodGroup: form.bloodGroup, heightCm: form.heightCm || null, weightKg: form.weightKg || null,
        normalHeartRateMin: form.normalHeartRateMin, normalHeartRateMax: form.normalHeartRateMax,
        normalBpSystolic: form.normalBpSystolic, normalBpDiastolic: form.normalBpDiastolic,
        normalTemperature: form.normalTemperature, normalOxygenSaturation: form.normalOxygenSaturation,
        emergencyContactName: form.emergencyContactName, emergencyContactPhone: form.emergencyContactPhone, emergencyContactRelation: form.emergencyContactRelation,
        allergies: form.selectedAllergies,
        conditions: form.selectedConditions,
        pastSurgeries: form.pastSurgeries ? form.pastSurgeries.split('\n').filter(Boolean) : [],
        currentMedications: form.currentMedications ? form.currentMedications.split('\n').filter(Boolean) : [],
        emergencyNotes: form.emergencyNotes,
        pin: form.pin || undefined,
      });
      if (data.success) {
        setQrData(data.data.qrData);
        setStep(4);
        await loadProfile();
      } else setError(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create profile');
    } finally { setLoading(false); }
  }

  function downloadQR() {
    const link = document.createElement('a');
    link.href = qrData.base64;
    link.download = 'emergency-qr.png';
    link.click();
  }

  const s = (n) => ({ fontWeight: 600, fontSize: 13, color: step >= n ? '#2563eb' : '#94a3b8' });

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', padding: '20px 16px 40px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🏥</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Complete Your Health Profile</h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Step {Math.min(step, 3)} of 3</p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 4, background: i <= Math.min(step, 3) ? '#2563eb' : '#e2e8f0', transition: 'background .3s' }} />
          ))}
        </div>

        <div className="card">
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>👤 Personal Information</h2>
              <div className="grid-2">
                <div className="input-group">
                  <label>First Name *</label>
                  <input className="input" value={form.firstName} onChange={set('firstName')} placeholder="John" required />
                </div>
                <div className="input-group">
                  <label>Last Name *</label>
                  <input className="input" value={form.lastName} onChange={set('lastName')} placeholder="Doe" required />
                </div>
              </div>
              <div className="input-group">
                <label>Date of Birth *</label>
                <input className="input" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} max={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="input-group">
                <label>Gender *</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['male', 'female', 'other'].map(g => (
                    <button key={g} type="button" onClick={() => setForm(f => ({ ...f, gender: g }))}
                      style={{ flex: 1, padding: '10px', borderRadius: 8, border: `2px solid ${form.gender === g ? '#2563eb' : '#e2e8f0'}`, background: form.gender === g ? '#eff6ff' : '#fff', color: form.gender === g ? '#2563eb' : '#64748b', fontWeight: 600, fontSize: 13, textTransform: 'capitalize', cursor: 'pointer' }}>
                      {g === 'male' ? '♂ Male' : g === 'female' ? '♀ Female' : '⚧ Other'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label>NIC / ID Number (Optional)</label>
                <input className="input" value={form.nic} onChange={set('nic')} placeholder="National ID number" />
              </div>
              <div className="input-group">
                <label>Emergency Contact Name</label>
                <input className="input" value={form.emergencyContactName} onChange={set('emergencyContactName')} placeholder="Full name" />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Their Phone</label>
                  <input className="input" value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')} placeholder="+94771234567" />
                </div>
                <div className="input-group">
                  <label>Relation</label>
                  <input className="input" value={form.emergencyContactRelation} onChange={set('emergencyContactRelation')} placeholder="Spouse, Parent…" />
                </div>
              </div>
              <button className="btn btn-primary btn-full btn-lg"
                onClick={() => { if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.gender) return setError('Please fill required fields'); setError(''); setStep(2); }}>
                Continue →
              </button>
              {error && <p className="error-text">{error}</p>}
            </div>
          )}

          {/* STEP 2: Allergies & Conditions */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>🩺 Medical History</h2>

              <div>
                <p className="section-title">Blood Group</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {BLOOD_GROUPS.map(bg => (
                    <button key={bg} type="button" onClick={() => setForm(f => ({ ...f, bloodGroup: bg }))}
                      style={{ padding: '7px 14px', borderRadius: 8, border: `2px solid ${form.bloodGroup === bg ? '#2563eb' : '#e2e8f0'}`, background: form.bloodGroup === bg ? '#eff6ff' : '#fff', color: form.bloodGroup === bg ? '#2563eb' : '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="section-title">Allergies</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {masterAllergies.map(a => {
                    const sel = form.selectedAllergies.find(s => s.allergyId === a.id);
                    return (
                      <button key={a.id} type="button" onClick={() => toggleAllergy(a.id, a.name)}
                        style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: `2px solid ${sel ? '#ef4444' : '#e2e8f0'}`, background: sel ? '#fee2e2' : '#fff', color: sel ? '#ef4444' : '#64748b', cursor: 'pointer' }}>
                        {sel ? '✓ ' : ''}{a.name}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" style={{ flex: 1 }} value={form.customAllergy} onChange={set('customAllergy')} placeholder="Add custom allergy…" />
                  <button type="button" className="btn btn-secondary" onClick={addCustomAllergy}>+ Add</button>
                </div>
                {form.selectedAllergies.filter(a => !a.allergyId).map((a, i) => (
                  <span key={i} className="chip chip-danger" style={{ marginTop: 6, display: 'inline-block' }}>{a.name}</span>
                ))}
              </div>

              <div>
                <p className="section-title">Active Conditions</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {masterConditions.map(c => {
                    const sel = form.selectedConditions.find(s => s.conditionId === c.id);
                    return (
                      <button key={c.id} type="button" onClick={() => toggleCondition(c.id, c.name)}
                        style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: `2px solid ${sel ? '#2563eb' : '#e2e8f0'}`, background: sel ? '#eff6ff' : '#fff', color: sel ? '#2563eb' : '#64748b', cursor: 'pointer' }}>
                        {sel ? '✓ ' : ''}{c.name}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" style={{ flex: 1 }} value={form.customCondition} onChange={set('customCondition')} placeholder="Add custom condition…" />
                  <button type="button" className="btn btn-secondary" onClick={addCustomCondition}>+ Add</button>
                </div>
              </div>

              <div className="input-group">
                <label>Past Surgeries (one per line)</label>
                <textarea className="input" value={form.pastSurgeries} onChange={set('pastSurgeries')} placeholder="Appendectomy 2018&#10;Knee replacement 2021" rows={3} />
              </div>

              <div className="input-group">
                <label>Current Medications (one per line)</label>
                <textarea className="input" value={form.currentMedications} onChange={set('currentMedications')} placeholder="Metformin 500mg&#10;Lisinopril 10mg" rows={3} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep(3)}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 3: Health baselines & PIN */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>📊 Health Baselines & Security</h2>
              <div className="grid-2">
                <div className="input-group">
                  <label>Height (cm)</label>
                  <input className="input" type="number" value={form.heightCm} onChange={set('heightCm')} placeholder="170" />
                </div>
                <div className="input-group">
                  <label>Weight (kg)</label>
                  <input className="input" type="number" value={form.weightKg} onChange={set('weightKg')} placeholder="70" />
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Heart Rate Min (bpm)</label>
                  <input className="input" type="number" value={form.normalHeartRateMin} onChange={set('normalHeartRateMin')} />
                </div>
                <div className="input-group">
                  <label>Heart Rate Max (bpm)</label>
                  <input className="input" type="number" value={form.normalHeartRateMax} onChange={set('normalHeartRateMax')} />
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Systolic BP</label>
                  <input className="input" type="number" value={form.normalBpSystolic} onChange={set('normalBpSystolic')} />
                </div>
                <div className="input-group">
                  <label>Diastolic BP</label>
                  <input className="input" type="number" value={form.normalBpDiastolic} onChange={set('normalBpDiastolic')} />
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Normal Temp (°C)</label>
                  <input className="input" type="number" step="0.1" value={form.normalTemperature} onChange={set('normalTemperature')} />
                </div>
                <div className="input-group">
                  <label>O₂ Saturation (%)</label>
                  <input className="input" type="number" value={form.normalOxygenSaturation} onChange={set('normalOxygenSaturation')} />
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0' }} />
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>🔐 Vault PIN (Optional)</h3>
              <p style={{ fontSize: 13, color: '#64748b' }}>Set a 4–6 digit PIN to quickly access your account.</p>
              <div className="grid-2">
                <div className="input-group">
                  <label>PIN</label>
                  <input className="input" type="password" value={form.pin} onChange={set('pin')} placeholder="••••" maxLength={6} />
                </div>
                <div className="input-group">
                  <label>Confirm PIN</label>
                  <input className="input" type="password" value={form.confirmPin} onChange={set('confirmPin')} placeholder="••••" maxLength={6} />
                </div>
              </div>

              {error && <p className="error-text">{error}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating Profile…' : 'Create Profile →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: QR Code */}
          {step === 4 && qrData && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 40 }}>✅</div>
              <h2 style={{ fontSize: 19, fontWeight: 700, color: '#10b981' }}>Profile Created!</h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>Your Emergency QR Code has been generated. Download and keep it accessible.</p>
              <img src={qrData.base64} alt="Emergency QR" style={{ width: 200, height: 200, border: '4px solid #2563eb', borderRadius: 16 }} />
              <div style={{ background: '#fef3c7', padding: 12, borderRadius: 10, fontSize: 13, color: '#92400e', textAlign: 'left' }}>
                ⚠️ This QR code gives emergency responders access to your critical health information — allergies, conditions, blood group, and emergency contacts.
              </div>
              <button className="btn btn-primary btn-full" onClick={downloadQR}>⬇ Download QR Image</button>
              <button className="btn btn-secondary btn-full" onClick={() => navigate('/')}>Continue to App →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
