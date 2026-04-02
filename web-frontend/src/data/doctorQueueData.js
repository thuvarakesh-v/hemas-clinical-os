export const queuePatients = [
  {
    id: 'p1',
    name: 'Sarah Jenkins',
    ageGender: '45 Yrs • Female',
    time: '04:30 - 04:45 PM',
    symptom: 'Chronic Hypertension',
    aiPriority: 'High',
    mode: 'Video Call',
    avatar: 'http://localhost:3845/assets/802c8837ff3177bff79e22b30442727becc96374.png',
    online: true,
    status: 'upcoming',
    action: 'Start Visit',
  },
  {
    id: 'p2',
    name: 'Michael Thorne',
    ageGender: '72 Yrs • Male',
    time: '04:50 - 05:05 PM',
    symptom: 'Post-Surgery Follow-up',
    aiPriority: 'Medium',
    mode: 'In-App',
    avatar: 'http://localhost:3845/assets/270a5bc8482830b442a929683bbb3c32768da44a.png',
    online: false,
    status: 'upcoming',
    action: 'Prepare',
  },
  {
    id: 'p3',
    name: 'Elena Rodriguez',
    ageGender: '29 Yrs • Female',
    time: '05:10 - 05:25 PM',
    symptom: 'Flu Symptoms',
    aiPriority: 'Low',
    mode: 'Audio Call',
    avatar: 'http://localhost:3845/assets/1d15cf087436fd72d0c7c2b290a1bf7cc49d267f.png',
    online: true,
    status: 'upcoming',
    action: 'Prepare',
  },
  {
    id: 'p4',
    name: 'Noah Patel',
    ageGender: '38 Yrs • Male',
    time: '05:30 - 05:45 PM',
    symptom: 'Chest Tightness',
    aiPriority: 'High',
    mode: 'In-App',
    avatar: 'http://localhost:3845/assets/270a5bc8482830b442a929683bbb3c32768da44a.png',
    online: true,
    status: 'ongoing',
    action: 'Start Visit',
  },
  {
    id: 'p5',
    name: 'Ava Kim',
    ageGender: '51 Yrs • Female',
    time: '03:45 - 04:00 PM',
    symptom: 'Migraine Review',
    aiPriority: 'Low',
    mode: 'Video Call',
    avatar: 'http://localhost:3845/assets/1d15cf087436fd72d0c7c2b290a1bf7cc49d267f.png',
    online: false,
    status: 'completed',
    action: 'Prepare',
  },
]

export const queueTabs = [
  { id: 'upcoming', label: 'Upcoming (08)' },
  { id: 'ongoing', label: 'Ongoing (01)' },
  { id: 'completed', label: 'Completed (03)' },
]

export const urgencyFilters = [
  { id: 'critical', label: 'Critical Emergency' },
  { id: 'high', label: 'High Priority' },
  { id: 'routine', label: 'Routine Follow-up' },
]

export const bookingTypes = ['In-Person', 'Video Call', 'Audio Call']

export const symptomCounts = [
  { label: 'Respiratory', count: '04' },
  { label: 'Cardiovascular', count: '02' },
  { label: 'Neurological', count: '01' },
]

export const assignedStaff = {
  name: 'Sarah Jenkins',
  ageGender: '45 Yrs • Female',
  time: '04:30 - 04:45 PM',
  focus: 'Queue Management',
  role: 'Nurse',
  avatar: 'http://localhost:3845/assets/802c8837ff3177bff79e22b30442727becc96374.png',
}
