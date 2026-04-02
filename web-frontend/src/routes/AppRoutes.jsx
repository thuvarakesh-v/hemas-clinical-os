import { Navigate, Route, Routes, useOutletContext } from 'react-router-dom'
import AppLayout from '../components/templates/AppLayout'
import DashboardPage from '../components/pages/DashboardPage'
import DoctorQueuePage from '../components/pages/DoctorQueuePage'
import AdminAddMemberPage from '../components/pages/AdminAddMemberPage'
import AdminFrameworkPage from '../components/pages/AdminFrameworkPage'
import LabDiagnosticsPage from '../components/pages/LabDiagnosticsPage'
import PatientDetailPage from '../components/pages/PatientDetailPage'
import PatientIntakePage from '../components/pages/PatientIntakePage'
import SosMonitorPage from '../components/pages/SosMonitorPage'
import SectionPage from '../components/pages/SectionPage'

function DashboardRoute() {
  const { openModal, interval, setInterval } = useOutletContext()
  return <DashboardPage onOpenModal={openModal} interval={interval} onIntervalChange={setInterval} />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardRoute />} />
        <Route path="/doctor" element={<DoctorQueuePage />} />
        <Route path="/lab" element={<LabDiagnosticsPage />} />
        <Route path="/sos-monitor" element={<SosMonitorPage />} />
        <Route path="/patients" element={<PatientIntakePage />} />
        <Route path="/patients/detail" element={<PatientDetailPage />} />
        <Route path="/ai-insights" element={<SectionPage title="AI Insights" />} />
        <Route path="/admin" element={<AdminFrameworkPage />} />
        <Route path="/admin/new-member" element={<AdminAddMemberPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
