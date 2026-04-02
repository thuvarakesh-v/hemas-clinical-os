import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import AddMemberContent from '../organisms/admin/AddMemberContent'
import { memberRoleOptions } from '../../data/addMemberData'

const initialForm = {
  fullName: '',
  employeeId: '',
  mobileNumber: '',
  password: '',
}

export default function AdminAddMemberPage() {
  const navigate = useNavigate()
  const { openModal } = useOutletContext()
  const [role, setRole] = useState('doctor')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [dirty, setDirty] = useState(false)

  const updateField = (key, value) => {
    setDirty(true)
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const validate = () => {
    if (!form.fullName.trim()) return 'Full Name is required.'
    if (!form.employeeId.trim()) return 'Employee ID is required.'
    if (!/^\+?[0-9()\-\s]{8,}$/.test(form.mobileNumber.trim())) return 'Enter a valid mobile number.'
    if (form.password.trim().length < 8) return 'Password must be at least 8 characters.'
    if (!memberRoleOptions.some((option) => option.id === role)) return 'Select a valid organizational role.'
    return null
  }

  const onCreateAccount = () => {
    const error = validate()
    if (error) {
      openModal('Validation', error)
      return
    }

    setDirty(false)
    openModal('Account Created', `${form.fullName} has been added as ${memberRoleOptions.find((item) => item.id === role)?.label}.`)
    navigate('/admin')
  }

  return (
    <AddMemberContent
      role={role}
      setRole={(nextRole) => {
        setDirty(true)
        setRole(nextRole)
      }}
      form={form}
      updateField={updateField}
      showPassword={showPassword}
      onTogglePassword={() => setShowPassword((value) => !value)}
      onCancel={() => navigate('/admin')}
      onCreateAccount={onCreateAccount}
      dirty={dirty}
      onAvatarUpload={() => openModal('Upload Avatar', 'Avatar uploader opened for this profile identity.')}
    />
  )
}
