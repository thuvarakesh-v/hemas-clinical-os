import { motion } from 'framer-motion'
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  ShieldAlert,
  Syringe,
  UserCog,
} from 'lucide-react'
import { adminSummary, permissionRows, systemHealthBars, thresholdRows } from '../../../data/adminData'

const roleTone = {
  doctor: 'bg-[#d5e0f8] text-[#586377]',
  lab: 'bg-[#ffdbce] text-[#370e00]',
  nurse: 'bg-[#bcc9c6] text-[#3d4947]',
}

const statusTone = {
  Active: 'text-[#00685f] dot-[#00685f]',
  Offline: 'text-[#3d4947] dot-[#3d4947]',
}

function renderPermissionBars(level) {
  return Array.from({ length: 3 }, (_, idx) => (
    <span
      key={idx}
      className={`h-2 w-6 rounded-full ${idx < level ? 'bg-[#00685f]' : 'bg-[rgba(188,201,198,0.3)]'}`}
    />
  ))
}

function ThresholdBar({ row }) {
  const colorMap = {
    safe: '#00685f',
    alert: 'rgba(186,26,26,0.2)',
    high: '#924628',
  }

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#eceef0]">
      <div className="flex h-full w-full">
        {row.segments.map((segment, index) => (
          <span key={`${row.id}-${segment}-${index}`} style={{ width: `${row.widths[index]}%`, backgroundColor: colorMap[segment] }} />
        ))}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onChange}
      className={`relative h-5 w-10 rounded-xl transition ${checked ? 'bg-[#00685f]' : 'bg-[#e0e3e5]'}`}
    >
      <span className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white transition ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  )
}

export default function AdminFrameworkContent({
  rows,
  page,
  onNextPage,
  onPrevPage,
  notifications,
  onToggleNotification,
  onExport,
  onAddMember,
  onEdit,
  onOpenActions,
  onUpdateBaseline,
  onProtocolLockdown,
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-8">
      <section className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-manrope text-[36px] font-extrabold leading-10 tracking-[-0.9px] text-[var(--ink)] max-md:text-[30px] max-md:leading-[36px] max-md:tracking-[-0.75px]">Admin Framework</h1>
          <p className="text-[16px] font-medium leading-6 text-[var(--muted)]">Manage system-wide permissions, user roles, and clinical thresholds.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-lg bg-[#e0e3e5] px-5 py-2.5 text-[16px] font-semibold text-[#586377] transition hover:bg-[#d8dee4]"
          >
            <Download size={13} /> Export Logs
          </button>
          <button
            type="button"
            onClick={onAddMember}
            className="inline-flex items-center gap-2 rounded-lg bg-[linear-gradient(168deg,#00685f_0%,#008378_100%)] px-6 py-2.5 text-[16px] font-semibold text-white shadow-[0_10px_15px_-3px_rgba(0,104,95,0.2),0_4px_6px_-4px_rgba(0,104,95,0.2)] transition hover:brightness-105"
          >
            <Plus size={14} /> Add New Member
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <article className="overflow-hidden rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-6">
              <h2 className="inline-flex items-center gap-2 font-manrope text-[18px] font-bold text-[var(--ink)]">
                <UserCog size={16} /> Personnel Management
              </h2>
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-[#d5e0f8] px-3 py-1 text-[12px] font-semibold text-[#586377]">{adminSummary.totalPersonnel} Total</span>
                <span className="rounded-xl bg-[#89f5e7] px-3 py-1 text-[12px] font-semibold text-[#00201d]">{adminSummary.activeNow} Active Now</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#f2f4f6]">
                  <tr className="text-left text-[12px] font-semibold uppercase tracking-[1.2px] text-[var(--muted)]">
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Clinical Role</th>
                    <th className="px-6 py-4">Access Level</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id} className={index !== 0 ? 'border-t border-[#eceef0]' : ''}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {row.avatar ? (
                            <img src={row.avatar} alt={row.name} className="h-10 w-10 rounded-xl object-cover" />
                          ) : (
                            <span className={`grid h-10 w-10 place-items-center rounded-xl text-[16px] font-semibold ${
                              row.initials === 'JS' ? 'bg-[#ccfbf1] text-[#0f766e]' : 'bg-[#f1f5f9] text-[#64748b]'
                            }`}>
                              {row.initials}
                            </span>
                          )}
                          <div>
                            <p className="text-[14px] font-semibold text-[var(--ink)]">{row.name}</p>
                            <p className="text-[12px] text-[var(--muted)]">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-xl px-3 py-1 text-[12px] font-medium ${roleTone[row.roleTone]}`}>
                          {row.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-[var(--muted)]">{row.access}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 text-[12px] font-semibold ${statusTone[row.status].split(' dot')[0]}`}>
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.status === 'Active' ? '#00685f' : '#3d4947', opacity: row.status === 'Active' ? 1 : 0.5 }} />
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => onEdit(row)} className="rounded p-2 text-[#94a3b8] transition hover:bg-[#f2f4f6] hover:text-[#0f766e]">
                            <Pencil size={15} />
                          </button>
                          <button type="button" onClick={() => onOpenActions(row)} className="rounded p-2 text-[#94a3b8] transition hover:bg-[#f2f4f6] hover:text-[#0f766e]">
                            <MoreVertical size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f2f4f6] p-4">
              <p className="text-[12px] font-medium text-[var(--muted)]">Showing {page * 10 - 9}-{Math.min(page * 10, adminSummary.totalPersonnel)} of {adminSummary.totalPersonnel} personnel</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onPrevPage} className="rounded border border-[#bcc9c6] p-1.5 text-[#6d7a77] disabled:opacity-50" disabled={page === 1}>
                  <ChevronLeft size={12} />
                </button>
                <button type="button" onClick={onNextPage} className="rounded border border-[#bcc9c6] p-1.5 text-[#6d7a77] disabled:opacity-50" disabled={page === Math.ceil(adminSummary.totalPersonnel / 10)}>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </article>

          <article className="rounded-lg bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div>
              <h3 className="font-manrope text-[30px] max-sm:text-[18px] font-bold leading-7 text-[var(--ink)]">Access Hierarchy Matrix</h3>
              <p className="mt-1 text-[14px] text-[var(--muted)]">Configure global permission sets for system roles.</p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                {permissionRows.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between rounded-lg bg-[#f2f4f6] p-3">
                    <div className="inline-flex items-center gap-3 text-[14px] font-semibold text-[var(--ink)]">
                      {permission.id === 'phi' ? <Eye size={16} className="text-[#0f766e]" /> : null}
                      {permission.id === 'rx' ? <Syringe size={16} className="text-[#0f766e]" /> : null}
                      {permission.id === 'vitals' ? <Activity size={16} className="text-[#0f766e]" /> : null}
                      {permission.label}
                    </div>
                    <div className="flex items-center gap-1">{renderPermissionBars(permission.level)}</div>
                  </div>
                ))}
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-[#f2f4f6] px-6 pb-10 pt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#0d9488]">System Health</p>
                <p className="mt-1 font-manrope text-[32px] font-extrabold leading-8 tracking-[-1.2px] text-[#134e4a]">99.98%</p>
                <p className="text-[12px] font-medium text-[var(--muted)]">Uptime over last 30 days</p>
                <div className="mt-4 flex h-12 items-end gap-1">
                  {systemHealthBars.map((height, idx) => (
                    <span
                      key={`${height}-${idx}`}
                      className="flex-1 rounded-[2px]"
                      style={{
                        height,
                        backgroundColor: ['#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#2dd4bf', '#5eead4', '#14b8a6'][idx],
                      }}
                    />
                  ))}
                </div>
                <div className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full border-[18px] border-[#e2e8f0] opacity-80" />
              </div>
            </div>
          </article>
        </div>

        <aside className="space-y-6 xl:col-span-4">
          <article className="overflow-hidden rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="border-b border-[#eceef0] px-6 py-6">
              <h3 className="font-manrope text-[18px] font-bold text-[var(--ink)]">Clinical Thresholds</h3>
              <p className="text-[12px] text-[var(--muted)]">Auto-trigger SOS alerts at these values.</p>
            </div>

            <div className="space-y-6 p-6">
              {thresholdRows.map((row) => (
                <div key={row.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.6px] text-[var(--ink)]">{row.label}</p>
                    <p className={`text-[12px] font-semibold ${row.id === 'bp' ? 'text-[#924628]' : 'text-[#ba1a1a]'}`}>{row.limit}</p>
                  </div>
                  <ThresholdBar row={row} />
                </div>
              ))}

              <button
                type="button"
                onClick={onUpdateBaseline}
                className="w-full rounded-lg bg-[#f2f4f6] py-3 text-[14px] font-semibold text-[#0f766e] transition hover:bg-[#e7ebee]"
              >
                Update Global Vitals Baseline
              </button>
            </div>
          </article>

          <article className="rounded-lg bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h3 className="font-manrope text-[18px] font-bold text-[var(--ink)]">System Notification</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-[var(--ink)]">SMS Alert Bypass</p>
                  <p className="text-[10px] text-[var(--muted)]">Send SMS for SOS even in silent mode.</p>
                </div>
                <Toggle checked={notifications.smsBypass} onChange={() => onToggleNotification('smsBypass')} ariaLabel="Toggle SMS Alert Bypass" />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-[var(--ink)]">Email Summary</p>
                  <p className="text-[10px] text-[var(--muted)]">Daily clinical shift logs for Admins.</p>
                </div>
                <Toggle checked={notifications.emailSummary} onChange={() => onToggleNotification('emailSummary')} ariaLabel="Toggle Email Summary" />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-[var(--ink)]">AI Predictor</p>
                  <p className="text-[10px] text-[var(--muted)]">Notify when AI detects health decline.</p>
                </div>
                <Toggle checked={notifications.aiPredictor} onChange={() => onToggleNotification('aiPredictor')} ariaLabel="Toggle AI Predictor" />
              </div>
            </div>
          </article>

          <article className="rounded-lg border-l-4 border-l-[#ba1a1a] bg-[#ffdad6] px-7 py-6">
            <h4 className="inline-flex items-center gap-2 text-[16px] font-semibold leading-6 text-[#93000a]">
              <ShieldAlert size={16} /> Protocol Lockdown
            </h4>
            <p className="mt-3 text-[12px] font-medium leading-[19.5px] text-[rgba(147,0,10,0.8)]">
              Activating Protocol Lockdown will restrict all non-emergency PHI exports and require double-factor authentication for all clinical actions.
            </p>
            <button
              type="button"
              onClick={onProtocolLockdown}
              className="mt-4 w-full rounded bg-[#ba1a1a] py-2 text-[12px] font-semibold uppercase tracking-[1.2px] text-white shadow-[0_10px_15px_-3px_rgba(186,26,26,0.2),0_4px_6px_-4px_rgba(186,26,26,0.2)] transition hover:brightness-105"
            >
              Initialize Lockdown
            </button>
          </article>
        </aside>
      </section>
    </motion.div>
  )
}
