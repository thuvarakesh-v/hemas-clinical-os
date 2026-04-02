import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import LabDiagnosticsContent from '../organisms/lab/LabDiagnosticsContent'

export default function LabDiagnosticsPage() {
  const { openModal, searchQuery } = useOutletContext()
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState('All Tests')
  const [upload, setUpload] = useState({
    patientReference: '',
    testCode: '',
    labUnit: 'Main Lab',
    fileName: '',
  })

  const onFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      openModal('Validation', 'File exceeds 50MB upload limit.')
      return
    }
    setUpload((value) => ({ ...value, fileName: file.name }))
  }

  const onUploadDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      openModal('Validation', 'File exceeds 50MB upload limit.')
      return
    }
    setUpload((value) => ({ ...value, fileName: file.name }))
  }

  const onOpenModal = (title, body) => {
    if (title === 'Process Metadata') {
      if (!upload.fileName || !upload.patientReference.trim() || !upload.testCode.trim()) {
        openModal('Validation', 'Upload file, patient reference, and test code are required before processing metadata.')
        return
      }
    }
    openModal(title, body)
  }

  return (
    <LabDiagnosticsContent
      search={searchQuery}
      filterOpen={filterOpen}
      setFilterOpen={setFilterOpen}
      selectedPriority={selectedPriority}
      setSelectedPriority={setSelectedPriority}
      upload={upload}
      setUpload={setUpload}
      onFileSelect={onFileSelect}
      onUploadDrop={onUploadDrop}
      onOpenModal={onOpenModal}
    />
  )
}
