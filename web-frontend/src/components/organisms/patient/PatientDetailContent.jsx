import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Circle,
  Download,
  Plus,
  Share2,
  SquarePen,
  Sparkles,
  MapPin,
  User,
  Droplets,
} from 'lucide-react'
import {
  activeConditions,
  aiSummary,
  criticalNote,
  patientProfile,
  timelineData,
  vitalCards,
} from '../../../data/patientDetailData'

const tabLabel = {
  lab: 'Lab Reports',
  visits: 'Visits',
  prescriptions: 'Prescriptions',
}

export default function PatientDetailContent({
  range,
  setRange,
  tab,
  setTab,
  chartBars,
  tabPayload,
  onOpenModal,
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-6 xl:space-y-8">
      <section className="rounded-lg border-l-4 border-[#00685f] bg-white px-6 py-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 gap-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]">
              <img src={patientProfile.avatar} alt={patientProfile.name} className="h-full w-full object-cover" />
              <span className="absolute -bottom-2 -right-2 h-5 w-5 rounded-full border-4 border-white bg-[#22c55e]" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-manrope text-[30px] font-extrabold leading-9 tracking-[-0.75px] text-[#134e4a] max-md:text-[24px]">{patientProfile.name}</h1>
                <span className="rounded-xl bg-[#d5e0f8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.5px] text-[#586377]">
                  Patient ID: {patientProfile.patientId}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-[#64748b]">
                <span className="inline-flex items-center gap-1"><User size={12} />{patientProfile.age}</span>
                <span className="inline-flex items-center gap-1"><User size={12} />{patientProfile.gender}</span>
                <span className="inline-flex items-center gap-1"><Droplets size={12} />{patientProfile.blood}</span>
                <span className="inline-flex items-center gap-1"><MapPin size={12} />{patientProfile.location}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-xl bg-[#f2f4f6] px-3 py-1 text-[12px] font-semibold text-[#0f766e]">{patientProfile.tags[0]}</span>
                <span className="rounded-xl bg-[#f2f4f6] px-3 py-1 text-[12px] font-semibold text-[#0f766e]">{patientProfile.tags[1]}</span>
                <span className="inline-flex items-center gap-1 rounded-xl bg-[#ffdbce] px-3 py-1 text-[12px] font-semibold text-[#370e00]"><AlertTriangle size={10} />{patientProfile.tags[2]}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 xl:items-end">
            <div className="text-left xl:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#94a3b8]">Last Visit</p>
              <p className="text-[14px] font-semibold text-[#115e59]">{patientProfile.lastVisit}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => onOpenModal('Edit Patient', 'Patient profile editor opened.')} className="rounded bg-[#f0fdfa] p-2 text-[#0d9488]"><SquarePen size={16} /></button>
              <button onClick={() => onOpenModal('Share Profile', 'Secure sharing options opened for this patient profile.')} className="rounded bg-[#f0fdfa] p-2 text-[#0d9488]"><Share2 size={16} /></button>
              <button
                onClick={() => onOpenModal('Schedule Appointment', 'Appointment scheduler launched for Arthur J. Henderson.')}
                className="rounded bg-[#00685f] px-4 py-2.5 text-[14px] font-semibold text-white"
              >
                Schedule Appointment
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-4">
          <article className="relative overflow-hidden rounded-2xl bg-[linear-gradient(132deg,#134e4a_0%,#115e59_100%)] p-6 text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
            <div className="pointer-events-none absolute -right-2 -top-1 h-32 w-32 rounded-full bg-[rgba(255,255,255,0.08)]" />
            <h3 className="inline-flex items-center gap-2 font-manrope text-[24px] max-sm:text-[18px] font-bold leading-7"><Sparkles size={18} />AI Health Summary</h3>

            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.1)] p-3 backdrop-blur-sm">
                <p className="text-[12px] font-semibold uppercase tracking-[0.6px] text-[#89f5e7]">{aiSummary.riskTitle}</p>
                <p className="mt-1 text-[14px] leading-[22.75px]">{aiSummary.riskText}</p>
              </div>

              <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.1)] p-3 backdrop-blur-sm">
                <p className="text-[12px] font-semibold uppercase tracking-[0.6px] text-[#89f5e7]">Recommendation</p>
                <ul className="mt-2 space-y-2">
                  {aiSummary.recommendations.map((item) => (
                    <li key={item} className="inline-flex items-center gap-2 text-[14px]"><Circle size={10} fill="currentColor" />{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h4 className="text-[14px] font-bold uppercase tracking-[1.4px] text-[#64748b]">Latest Vitals</h4>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {vitalCards.map((card) => (
                <div key={card.id} className="rounded-lg bg-[#f2f4f6] p-4">
                  <p className="text-[12px] text-[#64748b]">{card.label}</p>
                  <p className="mt-1 text-[24px] font-semibold leading-8 text-[#134e4a]">
                    {card.value} <span className={`text-[10px] ${card.tone === 'alert' ? 'text-[#ba1a1a]' : 'text-[#94a3b8]'}`}>{card.unit}</span>
                  </p>
                  <p className={`text-[10px] ${card.tone === 'alert' ? 'text-[#94a3b8]' : 'text-[#0d9488]'}`}>{card.footer}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="space-y-6 xl:col-span-8">
          <article className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-manrope text-[18px] font-bold text-[#134e4a]">Health Timeline & Glucose Trend</h3>
              <div className="rounded bg-[#f2f4f6] p-1">
                <button
                  onClick={() => setRange('6m')}
                  className={`rounded px-3 py-1 text-[12px] font-semibold ${range === '6m' ? 'bg-white text-[#0f766e] shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'text-[#64748b]'}`}
                >
                  6 Months
                </button>
                <button
                  onClick={() => setRange('1y')}
                  className={`rounded px-3 py-1 text-[12px] font-semibold ${range === '1y' ? 'bg-white text-[#0f766e] shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'text-[#64748b]'}`}
                >
                  1 Year
                </button>
              </div>
            </div>

            <div className="mt-5 h-[184px]">
              <div className="flex h-full items-end gap-[2px] rounded-b border-b border-[#f1f5f9] px-2 pb-2">
                {chartBars.map((height, idx) => (
                  <span
                    key={`${height}-${idx}`}
                    className={`flex-1 rounded-t-[2px] ${idx === 3 ? 'bg-[rgba(146,70,40,0.4)]' : idx === 9 ? 'bg-[#924628]' : 'bg-[rgba(0,104,95,0.2)]'}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-6 px-2 text-[10px] font-semibold uppercase text-[#94a3b8]">
              {timelineData.labels.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex overflow-x-auto border-b border-[#f1f5f9]">
              {Object.entries(tabLabel).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-8 pb-4 pt-4 text-[14px] font-semibold ${tab === key ? 'border-b-2 border-[#00685f] text-[#0f766e]' : 'text-[#94a3b8]'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[14px] font-semibold uppercase tracking-[1.4px] text-[#94a3b8]">Recent Panels (Nov 12, 2023)</p>
                <button onClick={() => onOpenModal('Export PDF', 'Patient records PDF export generated.')} className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0d9488]"><Download size={10} />Export PDF</button>
              </div>

              {tab === 'lab' ? (
                <div className="space-y-3">
                  {tabPayload.map((panel) => (
                    <div key={panel.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#f2f4f6] py-4 pl-5 pr-4 border-l-4 ${panel.tone === 'high' ? 'border-[#ba1a1a]' : 'border-[#14b8a6]'}`}>
                      <div>
                        <p className="text-[14px] font-semibold text-[#134e4a]">{panel.test}</p>
                        <p className="text-[10px] text-[#64748b]">{panel.lab}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className={`text-[18px] font-semibold ${panel.tone === 'high' ? 'text-[#ba1a1a]' : 'text-[#134e4a]'}`}>{panel.value}</p>
                          <p className="text-[10px] text-[#94a3b8]">{panel.reference}</p>
                        </div>
                        <span className={`rounded-[2px] px-2 py-1 text-[10px] font-semibold ${panel.tone === 'high' ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#ccfbf1] text-[#0f766e]'}`}>
                          {panel.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {tab === 'visits' ? (
                <div className="space-y-3">
                  {tabPayload.map((visit) => (
                    <div key={visit.id} className="rounded-lg bg-[#f2f4f6] p-4">
                      <p className="text-[12px] font-semibold text-[#115e59]">{visit.date}</p>
                      <p className="text-[12px] text-[#64748b]">{visit.note}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {tab === 'prescriptions' ? (
                <div className="space-y-3">
                  {tabPayload.map((rx) => (
                    <div key={rx.id} className="rounded-lg bg-[#f2f4f6] p-4">
                      <p className="text-[14px] font-semibold text-[#134e4a]">{rx.name}</p>
                      <p className="text-[12px] text-[#64748b]">{rx.detail}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              <button onClick={() => onOpenModal('Lab History', 'Full lab history timeline opened.')} className="mt-4 w-full rounded-lg border-2 border-dashed border-[#e2e8f0] py-3 text-[12px] font-semibold text-[#94a3b8]">
                View All Lab History
              </button>
            </div>
          </article>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <article className="rounded-2xl bg-white px-6 pb-8 pt-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <h4 className="text-[14px] font-semibold uppercase tracking-[1.4px] text-[#64748b]">Active Conditions</h4>
              <div className="mt-4 space-y-4">
                {activeConditions.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <span className={`mt-2 h-2 w-2 rounded-full ${item.tone === 'active' ? 'bg-[#00685f]' : 'bg-[#cbd5e1]'}`} />
                    <div>
                      <p className="text-[14px] font-semibold text-[#134e4a]">{item.name}</p>
                      <p className="text-[10px] text-[#94a3b8]">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border-2 border-[#ffdbce] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <h4 className="text-[14px] font-semibold uppercase tracking-[1.4px] text-[#924628]">Critical Notes</h4>
              <div className="mt-4 rounded bg-[rgba(255,219,206,0.3)] p-3">
                <p className="text-[12px] font-semibold text-[#924628]">{criticalNote.title}</p>
                <p className="mt-1 text-[11px] leading-[17.88px] text-[#773215]">{criticalNote.text}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-[#94a3b8]">{criticalNote.updated}</p>
                <button onClick={() => onOpenModal('Add Note', 'Clinical note editor opened.')} className="text-[11px] font-semibold text-[#0d9488] underline">Add Note</button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <button
        onClick={() => onOpenModal('New Encounter', 'New encounter workflow started for this patient profile.')}
        className="fixed bottom-24 right-4 z-20 inline-flex items-center gap-2 rounded-xl bg-[#008378] px-6 py-4 text-[14px] font-semibold text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] xl:bottom-8 xl:right-8"
      >
        <Plus size={14} /> New Encounter
      </button>
    </motion.div>
  )
}
