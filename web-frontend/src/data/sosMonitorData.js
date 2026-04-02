export const sosStatusFilters = [
  { id: 'unclaimed', label: 'Unclaimed' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in-progress', label: 'In Progress' },
]

export const sosFloors = ['FL 04', 'FL 03', 'FL 02']

export const sosMetrics = {
  avgResponseTime: '2m 14s',
  teamOnShift: 12,
  teamOnline: 14,
}

export const sosMapMarkers = [
  { id: 'arthur', left: 33, top: 28, tone: 'extreme' },
  { id: 'george', left: 68, top: 54, tone: 'moderate' },
  { id: 'sarah', left: 78, top: 71, tone: 'high' },
]

export const sosAlerts = [
  {
    id: 'arthur',
    name: 'Arthur Pendragon',
    location: 'Cardiology Wing, Room 402, 4th Floor',
    risk: 'Extreme',
    status: 'unclaimed',
    heartRate: 142,
    oxygen: 88,
    primaryAction: 'Claim Case',
    variant: 'critical',
  },
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    location: 'ICU, Bed 12 (North Ward)',
    risk: 'High',
    status: 'assigned',
    assignedDoctor: 'Dr. Michael Chen responding...',
    assignedAgo: 'Assigned 2m ago',
    variant: 'high',
  },
  {
    id: 'george',
    name: 'George Millman',
    location: 'Orthopedics, Room 104',
    risk: 'Moderate',
    status: 'in-progress',
    progress: 75,
    progressLabel: 'Treatment underway',
    primaryAction: 'View Details',
    variant: 'moderate',
  },
  {
    id: 'elena',
    name: 'Elena Rossi',
    location: 'Radiology Waiting Area',
    risk: 'Low',
    status: 'unclaimed',
    note: 'System-triggered alert: Rapid blood pressure drop detected.',
    primaryAction: 'Claim',
    variant: 'low',
    muted: true,
  },
]
