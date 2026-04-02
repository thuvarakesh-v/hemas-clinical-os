import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import PatientIntakeContent from '../organisms/patient/PatientIntakeContent'
import { defaultAllergies, initialIntakeForm } from '../../data/patientIntakeData'

export default function PatientIntakePage() {
  const navigate = useNavigate()
  const { openModal } = useOutletContext()

  const [form, setForm] = useState(initialIntakeForm)
  const [allergies, setAllergies] = useState(defaultAllergies)
  const [allergyInput, setAllergyInput] = useState('')

  const onImportCsv = () => {
    openModal('Import CSV', 'CSV import wizard is ready. Map fields and continue.')
  }

  const onAddAllergy = () => {
    const value = allergyInput.trim()
    if (!value) return
    if (!allergies.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setAllergies((current) => [...current, value])
    }
    setAllergyInput('')
  }

  const onRemoveAllergy = (value) => {
    setAllergies((current) => current.filter((item) => item !== value))
  }

  const onRegister = () => {
    if (!form.fullName.trim()) {
      openModal('Validation', 'Full name is required before registration.')
      return
    }
    if (!form.bloodGroup) {
      openModal('Validation', 'Please select a blood group.')
      return
    }
    if (!form.emergencyName.trim() || !form.emergencyMobile.trim()) {
      openModal('Validation', 'Emergency contact name and number are required.')
      return
    }

    openModal('Registration Complete', 'Patient profile registered and Smart Health Pass generated.')
    navigate('/patients/detail')
  }

  return (
    <PatientIntakeContent
      form={form}
      setForm={setForm}
      allergies={allergies}
      allergyInput={allergyInput}
      setAllergyInput={setAllergyInput}
      onAddAllergy={onAddAllergy}
      onRemoveAllergy={onRemoveAllergy}
      onImportCsv={onImportCsv}
      onRegister={onRegister}
      onOpenModal={openModal}
    />
  )
}
