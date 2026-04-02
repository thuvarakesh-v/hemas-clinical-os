import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BellRing,
  ChevronRight,
  CircleAlert,
  Download,
  Filter,
  Info,
  LocateFixed,
  MapPin,
  Minus,
  Plus,
} from 'lucide-react'

const riskTone = {
  Extreme: 'text-[#ba1a1a]',
  High: 'text-[#924628]',
  Moderate: 'text-[#00685f]',
  Low: 'text-[#6d7a77]',
}

const statusTone = {
  unclaimed: 'bg-[rgba(186,26,26,0.1)] text-[#ba1a1a]',
  assigned: 'bg-[#d5e0f8] text-[#586377]',
  'in-progress': 'bg-[#008378] text-white',
}

const cardTone = {
  critical: 'border-l-[#ba1a1a] bg-white',
  high: 'border-l-[#b05e3d] bg-white',
  moderate: 'border-l-[#89f5e7] bg-white',
  low: 'border-l-[#bcc9c6] bg-[rgba(255,255,255,0.5)]',
}

const iconTone = {
  critical: 'bg-[#ffdad6] text-[#ba1a1a]',
  high: 'bg-[#ffdbce] text-[#924628]',
  moderate: 'bg-[#89f5e7] text-[#00685f]',
  low: 'bg-[#e0e3e5] text-[#6d7a77]',
}

const statusLabel = {
  unclaimed: 'UNCLAIMED',
  assigned: 'ASSIGNED',
  'in-progress': 'IN PROGRESS',
}

const markerTone = {
  extreme: 'bg-[#ba1a1a]',
  high: 'bg-[#924628]',
  moderate: 'bg-[#00685f]',
}

function AlertSymbol({ variant }) {
  if (variant === 'critical') return <span className="text-[28px] leading-none">*</span>
  if (variant === 'high') return <AlertTriangle size={20} strokeWidth={2.1} />
  if (variant === 'moderate') return <BellRing size={19} strokeWidth={2.1} />
  return <Info size={19} strokeWidth={2.1} />
}

export default function SosMonitorContent({
  liveCount,
  alerts,
  filters,
  filterMenuOpen,
  onToggleFilter,
  onToggleFilterMenu,
  onExport,
  onClaimAlert,
  onOpenDetails,
  mapZoom,
  onZoom,
  markers,
  floor,
  floors,
  onFloorChange,
  metrics,
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-manrope text-[30px] font-extrabold leading-[36px] tracking-[-0.75px] text-[var(--ink)]">SOS Real-Time Monitor</h1>
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-xl bg-[#ffdad6] px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-[#ba1a1a] shadow-[0_0_0_3px_rgba(186,26,26,0.22)]" />
              <span className="text-[12px] font-semibold leading-4 text-[#93000a]">{liveCount} ACTIVE EMERGENCIES</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[14px] leading-5 text-[var(--muted)]">
              <LocateFixed size={12} /> Live Update: Just now
            </span>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onToggleFilterMenu}
            className="inline-flex items-center gap-2 rounded-lg bg-[#e0e3e5] px-4 py-2 text-[14px] font-semibold text-[#586377] transition hover:bg-[#d8dee4]"
          >
            <Filter size={14} /> Filter
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-lg bg-[#e0e3e5] px-4 py-2 text-[14px] font-semibold text-[#586377] transition hover:bg-[#d8dee4]"
          >
            <Download size={14} /> Export Log
          </button>

          {filterMenuOpen ? (
            <div className="absolute right-0 top-[calc(100%+8px)] z-10 w-52 rounded-xl border border-[var(--line)] bg-white p-3 shadow-[0_10px_25px_rgba(15,23,42,0.12)]">
              <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--slate-500)]">Status Filters</p>
              <div className="mt-2 space-y-2">
                {Object.entries(filters).map(([key, value]) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2 text-[13px] text-[var(--ink)]">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => onToggleFilter(key)}
                      className="h-4 w-4 rounded-[2px] border border-[#cbd5e1] accent-[var(--teal)]"
                    />
                    {statusLabel[key]}
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-4">
          {alerts.map((alert) => (
            <article
              key={alert.id}
              className={`rounded-lg border-l-4 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${cardTone[alert.variant]} ${
                alert.muted ? 'opacity-90' : ''
              }`}
            >
              <div className="flex gap-4">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ${iconTone[alert.variant]}`}>
                  <AlertSymbol variant={alert.variant} />
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className={`font-manrope text-[18px] font-bold leading-7 text-[var(--ink)] ${alert.muted ? 'opacity-70' : ''}`}>{alert.name}</h2>
                      <p className={`mt-0.5 inline-flex items-center gap-2 text-[14px] leading-5 text-[var(--muted)] ${alert.muted ? 'opacity-70' : ''}`}>
                        <MapPin size={12} /> {alert.location}
                      </p>
                    </div>

                    <div className="space-y-1 text-right">
                      <p className={`text-[10px] font-semibold uppercase tracking-[1px] ${riskTone[alert.risk]} ${alert.muted ? 'opacity-70' : ''}`}>
                        Risk: {alert.risk}
                      </p>
                      <span className={`inline-flex rounded-xl px-3 py-1 text-[12px] font-semibold ${statusTone[alert.status]}`}>
                        {statusLabel[alert.status]}
                      </span>
                    </div>
                  </div>

                  {alert.heartRate ? (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded bg-[var(--surface-2)] px-4 py-2">
                          <p className="text-[10px] font-semibold text-[var(--muted)]">HEART RATE</p>
                          <p className="font-manrope text-[20px] font-extrabold leading-7 text-[#ba1a1a]">
                            {alert.heartRate} <span className="text-[12px] font-normal">bpm</span>
                          </p>
                        </div>
                        <div className="rounded bg-[var(--surface-2)] px-4 py-2">
                          <p className="text-[10px] font-semibold text-[var(--muted)]">O2 LEVEL</p>
                          <p className="font-manrope text-[20px] font-extrabold leading-7 text-[var(--ink)]">{alert.oxygen}%</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onClaimAlert(alert)}
                        className="rounded-lg bg-[var(--teal)] px-8 py-3 text-[16px] font-semibold text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] transition hover:bg-[#00746a]"
                      >
                        {alert.primaryAction}
                      </button>
                    </div>
                  ) : null}

                  {alert.assignedDoctor ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[14px] font-medium leading-5 text-[var(--ink)]">{alert.assignedDoctor}</p>
                      <p className="text-[12px] font-medium leading-4 text-[var(--muted)]">{alert.assignedAgo}</p>
                    </div>
                  ) : null}

                  {alert.progress ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[#eceef0]">
                          <div className="h-full rounded-full bg-[var(--teal)]" style={{ width: `${alert.progress}%` }} />
                        </div>
                        <span className="text-[12px] font-semibold text-[var(--teal)]">{alert.progressLabel}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenDetails(alert)}
                        className="inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--teal)]"
                      >
                        View Details <ChevronRight size={14} />
                      </button>
                    </div>
                  ) : null}

                  {alert.note ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[12px] leading-4 text-[var(--muted)]">{alert.note}</p>
                      <button
                        type="button"
                        onClick={() => onClaimAlert(alert)}
                        className="rounded bg-[#e0e3e5] px-4 py-2 text-[12px] font-semibold text-[var(--ink)] transition hover:bg-[#d8dee4]"
                      >
                        {alert.primaryAction}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-[#eceef0] bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div
              className="relative h-[520px] overflow-hidden rounded-xl bg-[#dfe6ed]"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.45), transparent 46%), linear-gradient(135deg, #d8dee6 0%, #e6ebf1 100%)' }}
            >
              <div
                className="absolute inset-0 transition duration-300"
                style={{ transform: `scale(${mapZoom / 100})`, transformOrigin: 'center center' }}
              >
                <div className="absolute inset-[6%] rounded-lg border border-[rgba(148,163,184,0.35)]" />
                <div className="absolute inset-[18%] rounded-lg border border-[rgba(148,163,184,0.3)]" />
                <div className="absolute inset-[30%] rounded-lg border border-[rgba(148,163,184,0.26)]" />
                {markers.map((marker) => (
                  <span
                    key={marker.id}
                    className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.15)] ${markerTone[marker.tone]}`}
                    style={{ left: `${marker.left}%`, top: `${marker.top}%` }}
                  >
                    {marker.tone === 'extreme' ? (
                      <span className="absolute -inset-2 rounded-full bg-[#ba1a1a] opacity-30" />
                    ) : null}
                  </span>
                ))}
              </div>

              <div className="absolute right-4 top-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onZoom(10)}
                  className="grid h-10 w-10 place-items-center rounded bg-white text-[var(--slate-600)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
                  aria-label="Zoom in"
                >
                  <Plus size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onZoom(-10)}
                  className="grid h-10 w-10 place-items-center rounded bg-white text-[var(--slate-600)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
                  aria-label="Zoom out"
                >
                  <Minus size={14} />
                </button>
              </div>

              <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/60 bg-white/75 p-[13px] backdrop-blur-md">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-manrope text-[12px] font-bold uppercase leading-4 tracking-[-0.6px] text-[#134e4a]">
                    Live Floor
                    <br />
                    Tracking
                  </p>

                  <div className="flex gap-1">
                    {floors.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => onFloorChange(level)}
                        className={`rounded-[2px] px-[14px] py-1 text-[10px] font-semibold leading-[15px] transition ${
                          floor === level ? 'bg-[#134e4a] text-white' : 'bg-white/60 text-[#334155]'
                        }`}
                      >
                        <span className="block">{level.split(' ')[0]}</span>
                        <span className="block">{level.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <article className="rounded-2xl bg-[#008378] p-4 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.5px] opacity-80">Avg Response Time</p>
              <div className="mt-1 flex items-end gap-1">
                <h3 className="font-manrope text-[33px] font-extrabold leading-8">{metrics.avgResponseTime}</h3>
                <CircleAlert size={12} className="mb-1 opacity-80" />
              </div>
            </article>

            <article className="rounded-2xl border border-[#eceef0] bg-white px-[17px] py-[15px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-[var(--muted)]">Team on Shift</p>
              <p className="mt-1 text-[32px] font-extrabold leading-8 text-[#115e59] font-manrope">
                {metrics.teamOnShift}{' '}
                <span className="align-middle text-[12px] font-semibold text-[var(--muted)]">/ {metrics.teamOnline} Online</span>
              </p>
            </article>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
