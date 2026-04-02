export const patientProfile = {
  name: 'Arthur J. Henderson',
  patientId: '#882-991',
  age: '72 Years',
  gender: 'Male',
  blood: 'O Positive',
  location: 'Seattle, WA',
  lastVisit: 'Oct 24, 2023',
  avatar: 'http://localhost:3845/assets/6dd82dfea3e4f6766336d0f909a826532d750117.png',
  tags: ['Hypertension', 'Type 2 Diabetes', 'Penicillin Allergy'],
}

export const aiSummary = {
  riskTitle: 'Key Risk',
  riskText:
    'Elevated A1C levels suggest a trend toward uncontrolled glycemic index. Cardiac strain detected in last telemetry.',
  recommendations: ['Adjust Metformin dosage', 'Schedule echocardiogram'],
}

export const vitalCards = [
  { id: 'bp', label: 'Blood Pressure', value: '142/91', unit: '↑', footer: 'Borderline High', tone: 'alert' },
  { id: 'hr', label: 'Heart Rate', value: '72', unit: 'BPM', footer: 'Normal Range', tone: 'ok' },
  { id: 'glucose', label: 'Glucose', value: '108', unit: 'mg/dL', footer: 'Stable', tone: 'ok' },
  { id: 'oxygen', label: 'Oxygen Sat.', value: '98', unit: '%', footer: 'Optimal', tone: 'ok' },
]

export const timelineData = {
  labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  bars6Months: [40, 45, 55, 85, 60, 50, 45, 50, 65, 95, 70],
  barsYear: [35, 45, 42, 65, 55, 60, 58, 72, 66, 78, 70],
}

export const labPanels = [
  {
    id: 'a1c',
    test: 'Hemoglobin A1c',
    lab: 'Diagnostic Services Center',
    value: '5.8%',
    reference: 'Ref: 4.0 - 5.6',
    status: 'NORMAL',
    tone: 'normal',
  },
  {
    id: 'creatinine',
    test: 'Creatinine, Serum',
    lab: 'Urgent Diagnostics',
    value: '1.45',
    reference: 'Ref: 0.70 - 1.30',
    status: 'HIGH',
    tone: 'high',
  },
  {
    id: 'cholesterol',
    test: 'Cholesterol, Total',
    lab: 'Diagnostic Services Center',
    value: '188',
    reference: 'Ref: < 200',
    status: 'NORMAL',
    tone: 'normal',
  },
]

export const pastVisits = [
  { id: 'visit-1', date: 'Oct 24, 2023', note: 'Quarterly endocrine review with medication adjustments.' },
  { id: 'visit-2', date: 'Jul 16, 2023', note: 'Follow-up on glycemic trend and blood pressure control.' },
  { id: 'visit-3', date: 'Apr 09, 2023', note: 'Routine chronic care checkup and lab renewals.' },
]

export const prescriptions = [
  { id: 'rx-1', name: 'Metformin 500mg', detail: 'Twice daily after meals' },
  { id: 'rx-2', name: 'Lisinopril 10mg', detail: 'Once daily in morning' },
]

export const activeConditions = [
  { id: 'condition-1', name: 'Type 2 Diabetes Mellitus', detail: 'Diagnosed: 2018 • Dr. Aris', tone: 'active' },
  { id: 'condition-2', name: 'Essential Hypertension', detail: 'Diagnosed: 2015 • Dr. Moore', tone: 'active' },
  { id: 'condition-3', name: 'Osteoarthritis (Knee)', detail: 'Diagnosed: 2021 • Specialist Review', tone: 'monitor' },
]

export const criticalNote = {
  title: 'Medication Conflict',
  text: 'Patient reported mild dizziness when taking Lisinopril with new herbal supplements. Advised to discontinue supplements immediately.',
  updated: 'Last updated: 2 days ago',
}
