export const adminSummary = {
  totalPersonnel: 128,
  activeNow: 12,
}

export const personnelRows = [
  {
    id: 'u-001',
    name: 'John Stevens, MD',
    email: 'john.s@clinic.org',
    initials: 'JS',
    role: 'Doctor',
    roleTone: 'doctor',
    access: 'High Precision',
    status: 'Active',
  },
  {
    id: 'u-002',
    name: 'Sarah Chen',
    email: 's.chen@lab.clinic.org',
    avatar: 'http://localhost:3845/assets/f8a3ccedf681d84fecd28a9babbbac8881c82063.png',
    role: 'Lab Tech',
    roleTone: 'lab',
    access: 'Specimen Data Only',
    status: 'Active',
  },
  {
    id: 'u-003',
    name: 'Marcus Kovic',
    email: 'm.kovic@care.org',
    initials: 'MK',
    role: 'Nurse',
    roleTone: 'nurse',
    access: 'Standard Care',
    status: 'Offline',
  },
]

export const permissionRows = [
  { id: 'phi', label: 'View Patient PHI', level: 2 },
  { id: 'rx', label: 'Modify Prescriptions', level: 1 },
  { id: 'vitals', label: 'Real-time Vitals Stream', level: 3 },
]

export const systemHealthBars = [40, 48, 32, 44, 36, 40, 48, 28]

export const thresholdRows = [
  {
    id: 'hr',
    label: 'Heart Rate (BPM)',
    limit: '> 140 or < 45',
    segments: ['alert', 'safe', 'alert'],
    widths: [15, 70, 15],
  },
  {
    id: 'spo2',
    label: 'SpO2 Level (%)',
    limit: '< 88%',
    segments: ['alert', 'safe'],
    widths: [20, 80],
  },
  {
    id: 'bp',
    label: 'Blood Pressure (Sys)',
    limit: '> 180 mmHg',
    segments: ['safe', 'high'],
    widths: [85, 15],
  },
]

export const defaultNotifications = {
  smsBypass: true,
  emailSummary: false,
  aiPredictor: true,
}
