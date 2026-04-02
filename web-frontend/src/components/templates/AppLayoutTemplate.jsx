import { Outlet } from 'react-router-dom'
import Sidebar from '../organisms/layout/Sidebar'
import Topbar from '../organisms/Topbar'
import MobileBottomNav from '../organisms/layout/MobileBottomNav'
import QuickActionFab from '../organisms/layout/QuickActionFab'
import Modal from '../organisms/ui/Modal'

export default function AppLayoutTemplate({
  sideNavItems,
  openHelpCenter,
  openSettings,
  searchQuery,
  setSearchQuery,
  topTabs,
  activeTab,
  onTopTabChange,
  onEmergencyAlert,
  onProfileMenu,
  openModal,
  interval,
  setInterval,
  activeSideItem,
  isPatientDetailScreen,
  isSosScreen,
  fabOpen,
  setFabOpen,
  modal,
  closeModal,
}) {
  return (
    <div className="min-h-screen bg-(--app-bg) text-(--ink)">
      <div className="mx-auto flex min-h-screen w-full max-w-360 xl:items-start">
        <Sidebar items={sideNavItems} onHelpClick={openHelpCenter} onSettingsClick={openSettings} />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <Topbar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            tabs={topTabs}
            activeTab={activeTab}
            onTabChange={onTopTabChange}
            onEmergencyAlert={onEmergencyAlert}
            onProfileMenu={onProfileMenu}
          />

          <main className="flex-1 px-4 pb-24 pt-6 md:px-6 xl:px-8 xl:pt-8">
            <Outlet context={{ openModal, interval, setInterval, activeSideItem, searchQuery }} />
          </main>
        </div>
      </div>

      <MobileBottomNav items={sideNavItems} />
      <QuickActionFab
        mode={isPatientDetailScreen ? 'hidden' : isSosScreen ? 'sos' : 'default'}
        isOpen={fabOpen}
        onToggle={() => {
          if (isSosScreen) {
            openModal('Emergency Dispatch', 'Emergency team alert sent to on-shift staff and nearest responder nodes.')
            return
          }
          setFabOpen((value) => !value)
        }}
        onCreateAlert={() => {
          setFabOpen(false)
          openModal('Incident Created', 'A new incident workflow was created and assigned for review.')
        }}
        onCreateTask={() => {
          setFabOpen(false)
          openModal('Follow-up Task', 'Follow-up workflow created and assigned to the current care team.')
        }}
      />
      <Modal
        open={modal.open}
        title={modal.title}
        body={modal.body}
        onClose={closeModal}
        onConfirm={closeModal}
        confirmLabel="Acknowledge"
      />
    </div>
  )
}
