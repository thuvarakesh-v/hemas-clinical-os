import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Eye,
  FileUp,
  Filter,
  FlaskConical,
  PlusCircle,
  Search,
  Settings2,
  SquarePen,
  UploadCloud,
} from 'lucide-react'
import { incomingRequests, labUnits, resultsPreview } from '../../../data/labData'

const priorityTone = {
  Urgent: 'bg-[rgba(255,181,154,0.3)] text-[#924628] dot-[#924628]',
  Routine: 'bg-[#d5e0f8] text-[#545f73] dot-[#545f73]',
  Stat: 'bg-[#ffdad6] text-[#ba1a1a] dot-[#ba1a1a]',
}

const statusTone = {
  Processing: { icon: Settings2, color: '#0f766e' },
  Pending: { icon: Circle, color: '#f59e0b' },
  Completed: { icon: CheckCircle2, color: '#0d9488' },
}

const metricTone = {
  teal: {
    value: 'text-[var(--ink)]',
    chip: 'bg-[#dcfce7] text-[#15803d]',
    gradient: 'from-[rgba(0,104,95,0.1)]',
  },
  amber: {
    value: 'text-[#924628]',
    chip: 'bg-[rgba(255,181,154,0.4)] text-[#924628]',
    gradient: 'from-[rgba(146,70,40,0.1)]',
  },
  red: {
    value: 'text-[#ba1a1a]',
    chip: 'bg-[#ffdad6] text-[#ba1a1a]',
    gradient: 'from-[rgba(186,26,26,0.1)]',
  },
}

function getInitialTone(initials) {
  if (initials === 'RS') return 'bg-[rgba(0,104,95,0.1)] text-[var(--teal)]'
  if (initials === 'EW') return 'bg-[rgba(84,95,115,0.1)] text-[#545f73]'
  return 'bg-[rgba(186,26,26,0.1)] text-[#ba1a1a]'
}

export default function LabDiagnosticsContent({
  search,
  filterOpen,
  setFilterOpen,
  selectedPriority,
  setSelectedPriority,
  upload,
  setUpload,
  onFileSelect,
  onUploadDrop,
  onOpenModal,
}) {
  const filtered = incomingRequests.filter((item) => {
    const inSearch = item.patient.toLowerCase().includes(search.trim().toLowerCase())
    const inPriority = selectedPriority === 'All Tests' ? true : item.priority === selectedPriority
    return inSearch && inPriority
  })

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-8">
      <section className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-manrope text-[30px] font-extrabold tracking-[-0.75px] text-[var(--ink)]">Laboratory Diagnostics</h1>
          <p className="text-[16px] font-medium leading-6 text-[var(--muted)]">Managing 24 active test requests for today.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilterOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#e0e3e5] px-5 py-2.5 text-[16px] font-semibold text-[var(--ink)]"
          >
            <Filter size={14} /> Filters
          </button>
          <button
            onClick={() => onOpenModal('New Request', 'New lab request form opened.')}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--teal)] px-5 py-2.5 text-[16px] font-semibold text-white shadow-[0_10px_15px_-3px_rgba(0,104,95,0.2),0_4px_6px_-4px_rgba(0,104,95,0.2)]"
          >
            <PlusCircle size={16} /> New Request
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className="rounded-3xl border border-[rgba(241,245,249,0.3)] bg-white px-6 pb-16 pt-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] xl:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-manrope text-[18px] font-bold text-[var(--ink)]"><FlaskConical size={18} />Incoming Test Requests</h2>
            <div className="flex gap-2">
              {['All Tests', 'Urgent', 'Routine', 'Stat'].map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedPriority(item)}
                  className={`rounded-xl px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.5px] ${
                    selectedPriority === item ? 'bg-[#d5e0f8] text-[#586377]' : 'bg-[#e6e8ea] text-[var(--muted)]'
                  }`}
                >
                  {item === 'Urgent' ? 'Priority: High' : item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-[1.1px] text-[var(--muted)]">
                  <th className="px-4 py-2">Patient Name</th>
                  <th className="px-4 py-2">Test Type</th>
                  <th className="px-4 py-2">Priority</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const status = statusTone[row.status]
                  const StatusIcon = status.icon
                  return (
                    <tr key={row.id} className="rounded-2xl bg-[rgba(242,244,246,0.4)]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`grid h-8 w-8 place-items-center rounded-xl text-[12px] font-semibold ${getInitialTone(row.initials)}`}>
                            {row.initials}
                          </span>
                          <div>
                            <p className="text-[14px] font-semibold leading-5 text-[var(--ink)]">{row.patient}</p>
                            <p className="text-[10px] text-[var(--slate-500)]">ID: #{row.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[14px] leading-5 text-[var(--ink)]">{row.test}</p>
                        <p className="text-[10px] text-[var(--slate-500)]">{row.department}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-semibold ${priorityTone[row.priority].split(' dot')[0]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${priorityTone[row.priority].split('dot-')[1] ? '' : ''}`} style={{ backgroundColor: row.priority === 'Urgent' ? '#924628' : row.priority === 'Routine' ? '#545f73' : '#ba1a1a' }} />
                          {row.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--muted)]">
                          <StatusIcon size={12} style={{ color: status.color }} /> {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onOpenModal(row.action === 'edit' ? 'Request Editor' : 'Result Viewer', `${row.patient} ${row.action === 'edit' ? 'request editor' : 'result viewer'} opened.`)}
                          className="rounded p-2 text-[var(--teal)]"
                        >
                          {row.action === 'edit' ? <SquarePen size={16} /> : <Eye size={16} />}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-3xl border border-[rgba(241,245,249,0.3)] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] xl:col-span-4">
          <h2 className="flex items-center gap-2 font-manrope text-[18px] font-bold text-[var(--ink)]"><FileUp size={16} />Upload Report</h2>
          <label
            onDrop={onUploadDrop}
            onDragOver={(event) => event.preventDefault()}
            className="mt-4 block cursor-pointer rounded-2xl border-2 border-dashed border-[rgba(188,201,198,0.3)] p-8 text-center"
          >
            <UploadCloud size={28} className="mx-auto text-[var(--slate-400)]" />
            <p className="mt-2 text-[14px] font-semibold text-[var(--ink)]">Drop clinical files here</p>
            <p className="text-[10px] text-[var(--slate-500)]">PDF, HL7, or DICOM (Max 50MB)</p>
            <input type="file" className="hidden" onChange={onFileSelect} />
          </label>

          {upload.fileName && <p className="mt-2 text-[11px] text-[var(--teal)]">Selected: {upload.fileName}</p>}

          <div className="mt-6 space-y-4">
            <label className="block text-[10px] font-semibold uppercase tracking-[1px] text-[var(--slate-500)]">
              Patient Reference
              <input
                value={upload.patientReference}
                onChange={(event) => setUpload((v) => ({ ...v, patientReference: event.target.value }))}
                placeholder="Scan ID or Name"
                className="mt-1 h-11 w-full rounded-lg bg-[var(--surface-2)] px-4 text-[14px] text-[var(--ink)] outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-[10px] font-semibold uppercase tracking-[1px] text-[var(--slate-500)]">
                Test Code
                <input
                  value={upload.testCode}
                  onChange={(event) => setUpload((v) => ({ ...v, testCode: event.target.value }))}
                  placeholder="E.g. CBC-10"
                  className="mt-1 h-11 w-full rounded-lg bg-[var(--surface-2)] px-4 text-[14px] text-[var(--ink)] outline-none"
                />
              </label>
              <label className="block text-[10px] font-semibold uppercase tracking-[1px] text-[var(--slate-500)]">
                Lab Unit
                <select
                  value={upload.labUnit}
                  onChange={(event) => setUpload((v) => ({ ...v, labUnit: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-lg bg-[var(--surface-2)] px-4 text-[14px] text-[var(--ink)] outline-none"
                >
                  {labUnits.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </label>
            </div>

            <button
              onClick={() => onOpenModal('Process Metadata', 'Metadata parsing has started for uploaded clinical files.')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#e6e8ea] py-3 text-[16px] font-semibold text-[var(--ink)]"
            >
              Process Metadata <Search size={12} />
            </button>
          </div>
        </article>

        <article className="rounded-3xl border border-[rgba(241,245,249,0.3)] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] xl:col-span-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-manrope text-[18px] font-bold text-[var(--ink)]">Bespoke Results Preview</h3>
              <p className="text-[12px] font-medium text-[var(--muted)]">Last processed: Arthur Morgan (Metabolic Panel)</p>
            </div>
            <button className="inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--teal)]" onClick={() => onOpenModal('Full History', 'Opening complete laboratory history timeline.')}>View Full History <SquarePen size={11} /></button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {resultsPreview.map((metric) => {
              const tone = metricTone[metric.tone]
              return (
                <div key={metric.key} className="relative overflow-hidden rounded-2xl bg-[var(--surface-2)] p-5">
                  <div className={`pointer-events-none absolute bottom-0 right-0 h-16 w-24 rounded-tl-xl bg-gradient-to-t ${tone.gradient} to-transparent opacity-50`} />
                  <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--slate-500)]">{metric.key}</p>
                  <div className="mt-1 flex items-end gap-2">
                    <p className={`text-[30px] font-semibold leading-9 ${tone.value}`}>{metric.value}</p>
                    <p className="pb-1 text-[12px] font-semibold text-[var(--slate-400)]">{metric.unit}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded-xl px-2 py-0.5 text-[10px] font-semibold ${tone.chip}`}>{metric.state}</span>
                    <span className="text-[10px] text-[var(--slate-400)]">{metric.ref}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[rgba(248,250,252,0.5)] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-[0_10px_15px_-3px_rgba(0,104,95,0.2),0_4px_6px_-4px_rgba(0,104,95,0.2)]">
                  <AlertTriangle size={14} className="text-[var(--teal)]" />
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--ink)]">Automated Clinical Correlation</p>
                  <p className="text-[12px] text-[var(--slate-500)]">Elevated glucose and creatinine levels suggest possible nephropathy complications. AI correlation recommended.</p>
                </div>
              </div>
              <button
                onClick={() => onOpenModal('AI Analysis', 'Clinical AI analysis has started on latest uploaded panel.')}
                className="rounded bg-[rgba(0,104,95,0.1)] px-4 py-2 text-[12px] font-semibold text-[var(--teal)]"
              >
                Run AI Analysis
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className="flex flex-col items-start justify-between gap-3 border-t border-[var(--line)] pt-8 text-[10px] text-[var(--slate-400)] xl:flex-row xl:items-center">
        <div className="flex flex-wrap items-center gap-6 uppercase tracking-[1px] font-semibold">
          <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#14b8a6]" />Server Core: Optimal</span>
          <span className="inline-flex items-center gap-2"><Search size={10} />Sync: 2m ago</span>
        </div>
        <p>© 2024 Clinical Framework Intelligence v4.2.0. All clinical data encrypted and HIPPA compliant.</p>
      </section>

      {filterOpen && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-[rgba(15,23,42,0.35)] p-4" onClick={() => setFilterOpen(false)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-5" onClick={(event) => event.stopPropagation()}>
            <h4 className="font-manrope text-[20px] font-bold text-[var(--ink)]">Filter Requests</h4>
            <p className="mt-1 text-[13px] text-[var(--slate-500)]">Choose request priority to refine the incoming queue.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['All Tests', 'Urgent', 'Routine', 'Stat'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setSelectedPriority(item)
                    setFilterOpen(false)
                  }}
                  className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold ${selectedPriority === item ? 'bg-[var(--teal)] text-white' : 'bg-[var(--surface-2)] text-[var(--ink)]'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
