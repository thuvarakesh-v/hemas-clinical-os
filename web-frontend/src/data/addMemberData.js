export const memberRoleOptions = [
  { id: 'doctor', label: 'Doctor', icon: 'doctor' },
  { id: 'nurse', label: 'Nurse', icon: 'nurse' },
  { id: 'sos', label: 'SOS Manager', icon: 'sos' },
  { id: 'admin', label: 'Administrator', icon: 'admin' },
]

export const rolePermissionCopy = {
  doctor: {
    title: 'Doctor Access',
    points: [
      { label: 'Patient Records', detail: 'Full read/write access to clinical notes and history.', enabled: true },
      { label: 'Lab Prescriptions', detail: 'Order diagnostic tests and view real-time results.', enabled: true },
      { label: 'SOS Response', detail: 'Active intervention on critical patient alerts.', enabled: true },
      { label: 'System Configuration', detail: 'Administrator only access level.', enabled: false },
    ],
    quote: '"Doctors are granted high-level clinical oversight with strict auditing on data access."',
  },
  nurse: {
    title: 'Nurse Access',
    points: [
      { label: 'Patient Records', detail: 'Read and update assigned patient care notes.', enabled: true },
      { label: 'Lab Prescriptions', detail: 'View lab orders and complete nursing handoff checks.', enabled: true },
      { label: 'SOS Response', detail: 'Participate in bedside escalation workflows.', enabled: true },
      { label: 'System Configuration', detail: 'Administrator only access level.', enabled: false },
    ],
    quote: '"Nursing access prioritizes coordinated care workflows and triage execution."',
  },
  sos: {
    title: 'SOS Manager Access',
    points: [
      { label: 'Patient Records', detail: 'Access emergency timeline and critical history snapshots.', enabled: true },
      { label: 'Lab Prescriptions', detail: 'Review urgent diagnostics for escalation routing.', enabled: true },
      { label: 'SOS Response', detail: 'Own dispatch orchestration across emergency channels.', enabled: true },
      { label: 'System Configuration', detail: 'Administrator only access level.', enabled: false },
    ],
    quote: '"SOS managers are optimized for rapid incident coordination and response governance."',
  },
  admin: {
    title: 'Administrator Access',
    points: [
      { label: 'Patient Records', detail: 'Full read/write access to clinical notes and history.', enabled: true },
      { label: 'Lab Prescriptions', detail: 'Order diagnostic tests and view real-time results.', enabled: true },
      { label: 'SOS Response', detail: 'Active intervention on critical patient alerts.', enabled: true },
      { label: 'System Configuration', detail: 'Full administrator privileges across all modules.', enabled: true },
    ],
    quote: '"Administrative accounts maintain complete control over system configuration and governance."',
  },
}
