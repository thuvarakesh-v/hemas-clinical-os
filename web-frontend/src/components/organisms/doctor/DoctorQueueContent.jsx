import { motion } from 'framer-motion'
import { Calendar, Clipboard, Clock3, Sparkles, Stethoscope } from 'lucide-react'
import {
  assignedStaff,
  bookingTypes,
  queuePatients,
  queueTabs,
  symptomCounts,
  urgencyFilters,
} from '../../../data/doctorQueueData'

const priorityTone = {
  High: 'bg-[#ffdad6] text-[#93000a]',
  Medium: 'bg-[#ffdbce] text-[#370e00]',
  Low: 'bg-[#d8e3fb] text-[#111c2d]',
}

const modeTone = {
  'Video Call': 'bg-[#d5e0f8] text-[#586377]',
  'In-App': 'bg-[#e6e8ea] text-[#475569]',
  'Audio Call': 'bg-[#e6e8ea] text-[#475569]',
}

export default function DoctorQueueContent({
  search,
  queueTab,
  setQueueTab,
  session,
  setSession,
  selectedDate,
  setSelectedDate,
  bookingType,
  setBookingType,
  urgency,
  setUrgency,
  onStartVisit,
  onOpenModal,
}) {
  const hasUrgencyFilter = Object.values(urgency).some(Boolean)
  const urgencyMatch = {
    High: urgency.critical,
    Medium: urgency.high,
    Low: urgency.routine,
  }

  const filteredPatients = queuePatients.filter((patient) => {
    const inTab = patient.status === queueTab
    const inSearch = patient.name.toLowerCase().includes(search.trim().toLowerCase())
    const inBooking = bookingType ? patient.mode === bookingType : true
    const [hour, minute] = patient.time.split(' - ')[0].split(':').map(Number)
    const totalMinutes = (hour || 0) * 60 + (minute || 0)
    const inSession = session.startsWith('Morning') ? totalMinutes < 330 : totalMinutes >= 330
    const inUrgency = hasUrgencyFilter ? urgencyMatch[patient.aiPriority] : true
    return inTab && inSearch && inBooking && inSession && inUrgency
  })

  const toggleUrgency = (id) => {
    setUrgency((value) => ({ ...value, [id]: !value[id] }))
  }

  const moveDate = (delta) => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + delta)
    setSelectedDate(next)
  }

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-8">
      <section className="flex flex-col items-start justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="font-manrope text-[30px] font-extrabold leading-[36px] tracking-[-0.75px] text-[var(--ink)]">Queue Management</h1>
          <p className="text-[16px] font-medium leading-6 text-[var(--slate-500)]">
            You have <span className="font-semibold text-[var(--teal)]">12 appointments</span> scheduled for today.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center justify-start gap-3 xl:w-auto xl:justify-end">
          <div className="flex items-center rounded-lg border border-[var(--line)] bg-white p-[5px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <button onClick={() => moveDate(-1)} className="rounded p-2 text-[var(--slate-500)] hover:bg-[var(--surface-2)]">&lt;</button>
            <div className="px-4 text-center">
              <p className="text-[10px] font-semibold uppercase leading-[15px] text-[var(--slate-400)]">{formatDate(selectedDate)}</p>
              <p className="text-[14px] font-semibold leading-5 text-[#115e59]">Today</p>
            </div>
            <button onClick={() => moveDate(1)} className="rounded p-2 text-[var(--slate-500)] hover:bg-[var(--surface-2)]">&gt;</button>
          </div>

          <div className="flex rounded-lg bg-[var(--surface-2)] p-1">
            {['Morning (4:30-6:30)', 'Evening (5:30-7:30)'].map((item) => (
              <button
                key={item}
                onClick={() => setSession(item)}
                className={`rounded px-4 py-2 text-[12px] font-semibold leading-4 ${
                  session === item ? 'bg-white text-[var(--teal)] shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'text-[var(--slate-500)]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[288px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h3 className="font-manrope text-[14px] font-bold uppercase tracking-[1.4px] text-[var(--slate-400)]">Quick Filters</h3>

            <div className="mt-4 space-y-6">
              <div>
                <p className="text-[12px] font-semibold text-[#134e4a]">Urgency Status</p>
                <div className="mt-3 space-y-2">
                  {urgencyFilters.map((item) => (
                    <label key={item.id} className="flex items-center gap-3 text-[14px] text-[#475569]">
                      <input
                        type="checkbox"
                        checked={urgency[item.id]}
                        onChange={() => toggleUrgency(item.id)}
                        className="h-4 w-4 rounded-[2px] border border-[#cbd5e1] accent-[var(--teal)]"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] font-semibold text-[#134e4a]">Booking Type</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {bookingTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setBookingType(type)}
                      className={`rounded-xl border px-[13px] py-[7px] text-[12px] font-semibold ${
                        bookingType === type
                          ? 'border-[var(--teal)] text-[var(--teal)]'
                          : 'border-[#e2e8f0] text-[var(--slate-500)]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] font-semibold text-[#134e4a]">Common Symptoms</p>
                <div className="mt-3 space-y-2">
                  {symptomCounts.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded bg-[var(--surface-2)] p-2">
                      <span className="text-[14px] font-medium text-[var(--ink)]">{item.label}</span>
                      <span className="rounded-xl bg-white px-2 py-[2px] text-[10px] font-semibold text-[var(--ink)]">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[rgba(0,104,95,0.1)] bg-[rgba(0,104,95,0.05)] p-[25px]">
            <div className="flex items-center gap-2 text-[var(--teal)]">
              <Sparkles size={13} />
              <h4 className="font-manrope text-[14px] font-bold">AI Pulse Insights</h4>
            </div>
            <p className="mt-2 text-[12px] leading-[19.5px] text-[#475569]">
              Patient volume is projected to increase by 15% in the next hour based on historical SOS patterns.
            </p>
            <button
              onClick={() => onOpenModal('Forecast', 'Predicted peak load is expected in the next 60 minutes.')}
              className="mt-2 text-[10px] font-semibold uppercase tracking-[1px] text-[var(--teal)]"
            >
              View Forecast
            </button>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="border-b border-[#e2e8f0]">
            <div className="flex flex-wrap gap-1">
              {queueTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setQueueTab(tab.id)}
                  className={`px-6 pb-[18px] pt-4 text-[14px] font-semibold ${
                    queueTab === tab.id
                      ? 'border-b-2 border-[var(--teal)] text-[var(--teal)]'
                      : 'text-[var(--slate-400)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredPatients.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-[14px] text-[var(--slate-500)] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                No patient records match your current filters.
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <article key={patient.id} className="flex flex-col gap-4 rounded-2xl bg-white p-[21px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] 2xl:flex-row 2xl:items-center">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f1f5f9]">
                    <img src={patient.avatar} alt={patient.name} className="h-full w-full object-cover" />
                    <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${patient.online ? 'bg-[#22c55e]' : 'bg-[#cbd5e1]'}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-manrope text-[18px] font-bold leading-7 text-[var(--ink)]">{patient.name}</h4>
                      <span className="text-[12px] font-semibold text-[var(--slate-400)]">{patient.ageGender}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-[12px] font-semibold text-[var(--slate-500)]">
                      <span className="inline-flex items-center gap-1.5"><Clock3 size={14} />{patient.time}</span>
                      <span className="inline-flex items-center gap-1.5"><Stethoscope size={14} />{patient.symptom}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-3 2xl:flex-col 2xl:items-end">
                    <div className="flex gap-2">
                      <span className={`rounded-xl px-3 py-1 text-[10px] font-semibold uppercase tracking-[-0.25px] ${priorityTone[patient.aiPriority]}`}>
                        AI Priority: {patient.aiPriority}
                      </span>
                      <span className={`rounded-xl px-3 py-1 text-[10px] font-semibold uppercase tracking-[-0.25px] ${modeTone[patient.mode]}`}>
                        {patient.mode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenModal('Patient Notes', `Opening notes for ${patient.name}.`)}
                        className="rounded bg-[var(--surface-2)] p-2 text-[var(--slate-500)]"
                      >
                        <Clipboard size={16} />
                      </button>
                      <button
                        onClick={() =>
                          patient.action === 'Start Visit'
                            ? onStartVisit(patient)
                            : onOpenModal(patient.action, `${patient.action} action for ${patient.name} initiated.`)
                        }
                        className={`rounded px-5 py-2 text-[12px] font-semibold ${
                          patient.action === 'Start Visit'
                            ? 'bg-[linear-gradient(135deg,#00685f_0%,#008378_100%)] text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                            : 'border border-[var(--teal)] text-[var(--teal)]'
                        }`}
                      >
                        {patient.action}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <article className="relative overflow-hidden rounded-2xl bg-[var(--navy)] px-6 pb-[18px] pt-6 text-white">
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[1px] text-[#2dd4bf]">
                  <Sparkles size={11} /> Urgent Lab Update
                </p>
                <h4 className="font-manrope text-[20px] font-bold leading-[25px]">Critical Glucose levels detected for Sarah J.</h4>
                <p className="text-[12px] leading-4 text-[var(--slate-400)]">AI suggest immediate IV intervention prior to scheduled visit.</p>
              </div>
              <button
                onClick={() => onOpenModal('Lab Results', 'Critical glucose review opened for Sarah Jenkins.')}
                className="mt-3 rounded bg-white/10 px-4 py-2 text-[12px] font-semibold"
              >
                Review Results
              </button>
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-[118px] w-[88px] rounded-full border-[10px] border-[#1f3558]" />
            </article>

            <article className="flex items-center justify-between rounded-2xl border border-[rgba(226,232,240,0.5)] bg-[#e6e8ea] p-[25px]">
              <div>
                <h4 className="text-[14px] font-semibold uppercase tracking-[0.7px] text-[var(--ink)]">Queue Efficiency</h4>
                <div className="mt-3 flex items-end gap-2">
                  <span className="font-manrope text-[36px] font-extrabold leading-10 text-[var(--teal)]">94%</span>
                  <span className="pb-1 text-[12px] font-semibold text-[#16a34a]">+12% vs Yesterday</span>
                </div>
                <p className="mt-1 text-[10px] font-medium text-[var(--slate-500)]">Smart routing has saved 45 mins today.</p>
              </div>
              <div className="flex items-end gap-1">
                {[32, 48, 40, 64, 80].map((height, index) => (
                  <span
                    key={height}
                    className={`w-2 rounded-xl ${index === 4 ? 'bg-[var(--teal)]' : ''}`}
                    style={{ height, backgroundColor: index === 4 ? undefined : `rgba(0, 104, 95, ${(index + 1) * 0.2})` }}
                  />
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section>
        <div>
          <h2 className="font-manrope text-[30px] font-extrabold leading-[36px] tracking-[-0.75px] text-[var(--ink)]">Assigned Staff</h2>
          <p className="text-[16px] font-medium leading-6 text-[var(--slate-500)]"><span className="text-[#0f766e]">1 Staff</span> Member Has Assigned to Assist</p>
        </div>

        <article className="mt-4 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-[#f1f5f9]">
              <img src={assignedStaff.avatar} alt={assignedStaff.name} className="h-full w-full object-cover" />
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-[#22c55e]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h4 className="font-manrope text-[18px] font-bold text-[var(--ink)]">{assignedStaff.name}</h4>
                <span className="text-[12px] font-semibold text-[var(--slate-400)]">{assignedStaff.ageGender}</span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-4 text-[12px] font-semibold text-[var(--slate-500)]">
                <span className="inline-flex items-center gap-1.5"><Clock3 size={14} />{assignedStaff.time}</span>
                <span className="inline-flex items-center gap-1.5"><Calendar size={14} />{assignedStaff.focus}</span>
              </p>
              <span className="mt-2 inline-flex rounded-xl bg-[#94a3b8] px-4 py-[2px] text-[12px] font-semibold text-[#3d4947]">{assignedStaff.role}</span>
            </div>
          </div>
          <button
            onClick={() => onOpenModal('Emergency Call', 'Emergency call initiated with assigned staff support.')}
            className="rounded bg-[rgba(147,0,10,0.46)] px-5 py-2 text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          >
            Emergency Call
          </button>
        </article>
      </section>
    </motion.div>
  )
}
