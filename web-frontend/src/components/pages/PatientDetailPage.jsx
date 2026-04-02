import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import PatientDetailContent from '../organisms/patient/PatientDetailContent'
import { labPanels, pastVisits, prescriptions, timelineData } from '../../data/patientDetailData'

export default function PatientDetailPage() {
  const { openModal } = useOutletContext()
  const [range, setRange] = useState('6m')
  const [tab, setTab] = useState('lab')

  const chartBars = useMemo(() => (range === '6m' ? timelineData.bars6Months : timelineData.barsYear), [range])

  const tabPayload = useMemo(() => {
    if (tab === 'lab') return labPanels
    if (tab === 'visits') return pastVisits
    return prescriptions
  }, [tab])

  return (
    <PatientDetailContent
      range={range}
      setRange={setRange}
      tab={tab}
      setTab={setTab}
      chartBars={chartBars}
      tabPayload={tabPayload}
      onOpenModal={openModal}
    />
  )
}
