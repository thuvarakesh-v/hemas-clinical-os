import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import DoctorQueueContent from '../organisms/doctor/DoctorQueueContent'

export default function DoctorQueuePage() {
  const navigate = useNavigate()
  const { openModal, searchQuery } = useOutletContext()
  const [queueTab, setQueueTab] = useState('upcoming')
  const [session, setSession] = useState('Morning (4:30-6:30)')
  const [selectedDate, setSelectedDate] = useState(new Date('2023-10-24'))
  const [bookingType, setBookingType] = useState('In-Person')
  const [urgency, setUrgency] = useState({ critical: false, high: false, routine: false })

  const onBookingType = (type) => {
    setBookingType((value) => (value === type ? '' : type))
  }

  return (
    <DoctorQueueContent
      search={searchQuery}
      queueTab={queueTab}
      setQueueTab={setQueueTab}
      session={session}
      setSession={setSession}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      bookingType={bookingType}
      setBookingType={onBookingType}
      urgency={urgency}
      setUrgency={setUrgency}
      onStartVisit={(patient) => navigate('/patients/detail', { state: { patientId: patient.id } })}
      onOpenModal={openModal}
    />
  )
}
