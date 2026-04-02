import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import SosMonitorContent from '../organisms/sos/SosMonitorContent'
import { sosAlerts, sosFloors, sosMapMarkers, sosMetrics } from '../../data/sosMonitorData'

export default function SosMonitorPage() {
  const { openModal, searchQuery } = useOutletContext()
  const [alerts, setAlerts] = useState(sosAlerts)
  const [filters, setFilters] = useState({
    unclaimed: true,
    assigned: true,
    'in-progress': true,
  })
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [mapZoom, setMapZoom] = useState(100)
  const [floor, setFloor] = useState(sosFloors[0])

  const filteredAlerts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()
    return alerts.filter((alert) => {
      const statusMatch = filters[alert.status]
      const searchMatch =
        normalizedSearch.length === 0 ||
        `${alert.name} ${alert.location}`.toLowerCase().includes(normalizedSearch)
      return statusMatch && searchMatch
    })
  }, [alerts, filters, searchQuery])

  const liveCount = alerts.filter((alert) => alert.status === 'unclaimed').length

  const onToggleFilter = (id) => {
    setFilters((value) => ({ ...value, [id]: !value[id] }))
  }

  const onClaimAlert = (alert) => {
    if (alert.status === 'unclaimed') {
      setAlerts((items) =>
        items.map((item) => (item.id === alert.id ? { ...item, status: 'assigned', assignedAgo: 'Assigned just now' } : item)),
      )
    }

    openModal('Case Action', `${alert.name} has been updated in the SOS workflow.`)
  }

  const onOpenDetails = (alert) => {
    openModal('Patient Detail', `Opening live emergency details for ${alert.name}.`)
  }

  const onExport = () => {
    openModal('Export Log', `${filteredAlerts.length} SOS entries are queued for export.`)
  }

  const onZoom = (delta) => {
    setMapZoom((value) => Math.max(70, Math.min(140, value + delta)))
  }

  return (
    <SosMonitorContent
      liveCount={liveCount}
      alerts={filteredAlerts}
      filters={filters}
      filterMenuOpen={filterMenuOpen}
      onToggleFilter={onToggleFilter}
      onToggleFilterMenu={() => setFilterMenuOpen((value) => !value)}
      onExport={onExport}
      onClaimAlert={onClaimAlert}
      onOpenDetails={onOpenDetails}
      mapZoom={mapZoom}
      onZoom={onZoom}
      markers={sosMapMarkers}
      floor={floor}
      floors={sosFloors}
      onFloorChange={setFloor}
      metrics={sosMetrics}
    />
  )
}
