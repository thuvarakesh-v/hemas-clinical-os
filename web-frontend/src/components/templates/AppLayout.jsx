import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import AppLayoutTemplate from './AppLayoutTemplate'
import { sideNavItems, topTabs } from '../../data/mockData'

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('lookup')
  const [fabOpen, setFabOpen] = useState(false)
  const [interval, setInterval] = useState('Weekly')
  const [modal, setModal] = useState({ open: false, title: '', body: '' })
  const isSosScreen = location.pathname === '/sos-monitor'
  const isPatientDetailScreen = location.pathname === '/patients/detail'

  const activeSideItem = useMemo(
    () => sideNavItems.find((item) => item.route === location.pathname) ?? sideNavItems[0],
    [location.pathname],
  )

  const openModal = (title, body) => setModal({ open: true, title, body })
  const closeModal = () => setModal((value) => ({ ...value, open: false }))
  const openHelpCenter = () =>
    openModal(
      'Help Center',
      'Use the sidebar to switch between dashboard, patients, lab, doctor, SOS, and admin sections. For urgent operational issues, contact the on-call coordinator or your system administrator.',
    )
  const openSettings = () =>
    openModal(
      'Settings',
      'This workspace uses shared app state from the top bar and sidebar. User preferences are not persisted yet, but this button is now connected and ready for a future settings screen.',
    )

  const onTopTabChange = (id) => {
    setActiveTab(id)
    if (id === 'lookup') navigate('/patients')
    if (id === 'reports') navigate('/lab')
    if (id === 'schedule') navigate('/doctor')
  }

  return (
    <AppLayoutTemplate
      sideNavItems={sideNavItems}
      openHelpCenter={openHelpCenter}
      openSettings={openSettings}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      topTabs={topTabs}
      activeTab={activeTab}
      onTopTabChange={onTopTabChange}
      onEmergencyAlert={() => openModal('Emergency Alert', 'Emergency alert has been escalated to ICU and on-call response teams.')}
      onProfileMenu={() => openModal('Profile Actions', 'Profile menu opened. Preferences and account controls are available here.')}
      openModal={openModal}
      interval={interval}
      setInterval={setInterval}
      activeSideItem={activeSideItem}
      isPatientDetailScreen={isPatientDetailScreen}
      isSosScreen={isSosScreen}
      fabOpen={fabOpen}
      setFabOpen={setFabOpen}
      modal={modal}
      closeModal={closeModal}
    />
  )
}
