export const bloodGroups = ['A Positive', 'A Negative', 'B Positive', 'B Negative', 'AB Positive', 'AB Negative', 'O Positive', 'O Negative']

export const defaultAllergies = ['Peanuts', 'Penicillin']

export const statusChecks = [
  {
    id: 'identity',
    title: 'Identity Verification',
    subtitle: 'Checking global records...',
    state: 'secure',
  },
  {
    id: 'address',
    title: 'Address Validation',
    subtitle: 'Awaiting input field completion',
    state: 'pending',
  },
]

export const initialIntakeForm = {
  fullName: '',
  nationalId: '9876543210V',
  countryCode: '+1',
  mobile: '',
  bloodGroup: '',
  emergencyName: '',
  emergencyMobile: '',
}
