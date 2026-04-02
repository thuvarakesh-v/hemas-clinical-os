import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import AdminFrameworkContent from '../organisms/admin/AdminFrameworkContent'
import { defaultNotifications, personnelRows } from '../../data/adminData'

export default function AdminFrameworkPage() {
  const navigate = useNavigate()
  const { openModal, searchQuery } = useOutletContext()
  const [page, setPage] = useState(1)
  const [notifications, setNotifications] = useState(defaultNotifications)

  const rows = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    const filtered = personnelRows.filter((row) =>
      normalized.length === 0 ? true : `${row.name} ${row.email} ${row.role}`.toLowerCase().includes(normalized),
    )
    return filtered.slice((page - 1) * 10, page * 10)
  }, [page, searchQuery])

  const maxPage = Math.ceil(personnelRows.length / 10)

  const onToggleNotification = (key) => {
    setNotifications((value) => ({ ...value, [key]: !value[key] }))
  }

  return (
    <AdminFrameworkContent
      rows={rows}
      page={page}
      onNextPage={() => setPage((value) => Math.min(value + 1, maxPage))}
      onPrevPage={() => setPage((value) => Math.max(value - 1, 1))}
      notifications={notifications}
      onToggleNotification={onToggleNotification}
      onExport={() => openModal('Export Logs', 'Admin personnel and system audit logs are being prepared for export.')}
      onAddMember={() => navigate('/admin/new-member')}
      onEdit={(row) => openModal('Edit Member', `Editing account and permissions for ${row.name}.`)}
      onOpenActions={(row) => openModal('Quick Actions', `Quick actions menu opened for ${row.name}.`)}
      onUpdateBaseline={() => openModal('Threshold Baseline', 'Global clinical baseline update has been queued for approval.')}
      onProtocolLockdown={() =>
        openModal(
          'Protocol Lockdown',
          'Protocol Lockdown initialized. Non-emergency PHI exports are restricted and two-factor verification is enforced.',
        )
      }
    />
  )
}
