export const sideNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', route: '/' },
  { id: 'doctor', label: 'Doctor', icon: 'Stethoscope', route: '/doctor' },
  { id: 'lab', label: 'Lab', icon: 'FlaskConical', route: '/lab' },
  { id: 'sos', label: 'SOS Monitor', icon: 'ShieldAlert', route: '/sos-monitor' },
  { id: 'patients', label: 'Patients', icon: 'Users', route: '/patients' },
  { id: 'ai', label: 'AI Insights', icon: 'BrainCircuit', route: '/ai-insights' },
  { id: 'admin', label: 'Admin', icon: 'UserCog', route: '/admin' },
]

export const topTabs = [
  { id: 'lookup', label: 'Patient Lookup' },
  { id: 'reports', label: 'Reports' },
  { id: 'schedule', label: 'Schedule' },
]

export const stats = [
  {
    id: 'active',
    title: 'Active Cases',
    value: '12,842',
    delta: '+2.4%',
    tone: 'teal',
    progress: 65,
  },
  {
    id: 'risk',
    title: 'High-Risk Patients',
    value: '1,104',
    delta: '+8.1%',
    tone: 'amber',
    progress: 42,
  },
  {
    id: 'alerts',
    title: 'Recent Alerts',
    value: '24',
    delta: 'Critical',
    tone: 'red',
    progress: 15,
  },
  {
    id: 'recovered',
    title: 'Recovered Rate',
    value: '94.2%',
    delta: '-4.2%',
    tone: 'slate',
    progress: 94,
  },
]

export const trendPoints = [
  { day: 'Mon', value: 45, display: '4.5k' },
  { day: 'Tue', value: 62, display: '6.2k' },
  { day: 'Wed', value: 55, display: '5.5k' },
  { day: 'Thu', value: 85, display: '8.5k' },
  { day: 'Fri', value: 70, display: '7.0k' },
  { day: 'Sat', value: 40, display: '4.0k' },
  { day: 'Sun', value: 95, display: '9.5k Alert' },
]

export const riskRows = [
  {
    cluster: 'Elderly - Zone A',
    population: '1,240',
    risk: 'High',
    concern: 'Cardiovascular',
  },
  {
    cluster: 'Industrial Workers - North',
    population: '2,850',
    risk: 'Moderate',
    concern: 'Respiratory',
  },
  {
    cluster: 'Residential - South Delta',
    population: '5,420',
    risk: 'Low',
    concern: 'Preventative',
  },
]

export const logs = [
  {
    id: 1,
    label: 'Critical SOS',
    message: 'Patient ID: 4429 - ICU Floor 2',
    time: '2 mins ago',
    tone: 'red',
  },
  {
    id: 2,
    label: 'Lab Update',
    message: 'Weekly trend report generated',
    time: '1 hour ago',
    tone: 'teal',
  },
  {
    id: 3,
    label: 'System Alert',
    message: 'API Latency increase in DB_02',
    time: '4 hours ago',
    tone: 'amber',
  },
  {
    id: 4,
    label: 'Routine',
    message: 'Backup completed successfully',
    time: 'Yesterday',
    tone: 'slate',
  },
]

export const insights = [
  'Increase in respiratory cases this week (+14%) detected in Northern Sector.',
  'Recommended action: increase nebulizer inventory and triage support staffing.',
]
