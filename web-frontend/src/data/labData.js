export const incomingRequests = [
  {
    id: '44291',
    initials: 'RS',
    patient: 'Robert Sullivan',
    test: 'Complete Blood Count',
    department: 'Hematology',
    priority: 'Urgent',
    status: 'Processing',
    action: 'edit',
  },
  {
    id: '44288',
    initials: 'EW',
    patient: 'Elena Wagner',
    test: 'Lipid Panel',
    department: 'Biochemistry',
    priority: 'Routine',
    status: 'Pending',
    action: 'edit',
  },
  {
    id: '44285',
    initials: 'AM',
    patient: 'Arthur Morgan',
    test: 'Glucose Tolerance',
    department: 'Metabolic',
    priority: 'Stat',
    status: 'Completed',
    action: 'view',
  },
]

export const resultsPreview = [
  {
    key: 'Hemoglobin (HGB)',
    value: '14.2',
    unit: 'g/dL',
    state: 'Normal',
    ref: 'Ref: 13.5 - 17.5',
    tone: 'teal',
  },
  {
    key: 'Glucose (Fasting)',
    value: '118',
    unit: 'mg/dL',
    state: 'Elevated',
    ref: 'Ref: 70 - 99',
    tone: 'amber',
  },
  {
    key: 'White Cells (WBC)',
    value: '6.4',
    unit: 'x10³/μL',
    state: 'Normal',
    ref: 'Ref: 4.5 - 11.0',
    tone: 'teal',
  },
  {
    key: 'Creatinine',
    value: '2.1',
    unit: 'mg/dL',
    state: 'Critical',
    ref: 'Ref: 0.7 - 1.3',
    tone: 'red',
  },
]

export const labUnits = ['Main Lab', 'Satellite Unit', 'Emergency Lab']
