import { motion } from 'framer-motion'
import { AlertCircle, BellRing, CheckCircle2, FileUp, IdCard, MessageSquare, Plus, QrCode, Search, ShieldCheck, UserRoundPlus, X } from 'lucide-react'
import { bloodGroups, statusChecks } from '../../../data/patientIntakeData'

export default function PatientIntakeContent({
  form,
  setForm,
  allergies,
  allergyInput,
  setAllergyInput,
  onAddAllergy,
  onRemoveAllergy,
  onImportCsv,
  onRegister,
  onOpenModal,
}) {
  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }))
  }

  const cardName = form.fullName.trim() || 'Alexander Pierce'
  const cardBlood = form.bloodGroup || 'A Positive'
  const cardId = `CI-${(form.nationalId || '99204X').replace(/\s+/g, '').slice(0, 6).toUpperCase()}`

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-8">
      <section className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-manrope text-[30px] font-extrabold tracking-[-0.75px] text-[#134e4a]">New Patient Intake</h1>
          <p className="text-[16px] leading-6 text-[var(--muted)]">Register medical profile and generate digital identity.</p>
        </div>
        <button
          onClick={onImportCsv}
          className="inline-flex items-center gap-2 rounded bg-[#e0e3e5] px-4 py-2 text-[14px] font-semibold text-[#586377] transition hover:brightness-95"
        >
          <FileUp size={14} /> Import CSV
        </button>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[7fr_5fr]">
        <article className="rounded-lg border border-[rgba(241,245,249,0.5)] bg-white px-[33px] pb-[49px] pt-[33px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-manrope text-[18px] font-bold text-[var(--ink)]"><UserRoundPlus size={18} />Patient Information</h2>
            <span className="rounded-xl bg-[#89f5e7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[1px] text-[var(--teal)]">Section 1 of 2</span>
          </div>

          <form
            className="mt-6 space-y-6"
            onSubmit={(event) => {
              event.preventDefault()
              onRegister()
            }}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="space-y-2 text-[12px] font-semibold text-[var(--muted)]">
                FULL NAME
                <input
                  value={form.fullName}
                  onChange={(event) => setField('fullName', event.target.value)}
                  placeholder="e.g. Alexander Pierce"
                  className="h-11 w-full rounded-lg bg-[var(--surface-2)] px-4 text-[14px] text-[var(--ink)] outline-none ring-1 ring-transparent focus:ring-[var(--teal)]"
                />
              </label>
              <label className="space-y-2 text-[12px] font-semibold text-[var(--muted)]">
                NIC / PASSPORT NUMBER
                <input
                  value={form.nationalId}
                  onChange={(event) => setField('nationalId', event.target.value)}
                  className="h-11 w-full rounded-lg bg-[var(--surface-2)] px-4 text-[14px] text-[var(--slate-500)] outline-none ring-1 ring-transparent focus:ring-[var(--teal)]"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-[12px] font-semibold text-[var(--muted)]">MOBILE NUMBER</p>
                <div className="flex h-11 overflow-hidden rounded-lg">
                  <input
                    value={form.countryCode}
                    onChange={(event) => setField('countryCode', event.target.value)}
                    className="w-16 border-r border-white/20 bg-[#eceef0] px-4 text-[12px] font-semibold text-[var(--muted)] outline-none"
                  />
                  <input
                    value={form.mobile}
                    onChange={(event) => setField('mobile', event.target.value)}
                    placeholder="(555) 000-0000"
                    className="flex-1 bg-[var(--surface-2)] px-4 text-[14px] text-[var(--ink)] outline-none"
                  />
                </div>
              </div>
              <label className="space-y-2 text-[12px] font-semibold text-[var(--muted)]">
                BLOOD GROUP
                <select
                  value={form.bloodGroup}
                  onChange={(event) => setField('bloodGroup', event.target.value)}
                  className="h-11 w-full rounded-lg bg-[var(--surface-2)] px-4 text-[14px] text-[var(--ink)] outline-none"
                >
                  <option value="">Select Group</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-[12px] font-semibold text-[var(--muted)]">KNOWN ALLERGIES</p>
              <div className="flex min-h-[52px] flex-wrap items-center gap-2 rounded-lg bg-[var(--surface-2)] p-2">
                {allergies.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-xl bg-[#ffdbce] px-3 py-1 text-[12px] font-semibold text-[#370e00]">
                    {item}
                    <button type="button" onClick={() => onRemoveAllergy(item)}><X size={10} /></button>
                  </span>
                ))}
                <input
                  value={allergyInput}
                  onChange={(event) => setAllergyInput(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), onAddAllergy())}
                  placeholder="Add allergy..."
                  className="h-8 min-w-[120px] flex-1 bg-transparent px-3 text-[14px] text-[var(--ink)] outline-none"
                />
              </div>
            </div>

            <div className="border-t border-[#e6e8ea] pt-6">
              <p className="text-[14px] font-bold uppercase tracking-[0.7px] text-[var(--muted)]">Emergency Contact Details</p>
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                <label className="space-y-2 text-[12px] font-semibold text-[var(--muted)]">
                  CONTACT NAME
                  <input
                    value={form.emergencyName}
                    onChange={(event) => setField('emergencyName', event.target.value)}
                    placeholder="Next of Kin Name"
                    className="h-11 w-full rounded-lg bg-[var(--surface-2)] px-4 text-[14px] text-[var(--ink)] outline-none ring-1 ring-transparent focus:ring-[var(--teal)]"
                  />
                </label>
                <label className="space-y-2 text-[12px] font-semibold text-[var(--muted)]">
                  CONTACT NUMBER
                  <input
                    value={form.emergencyMobile}
                    onChange={(event) => setField('emergencyMobile', event.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="h-11 w-full rounded-lg bg-[var(--surface-2)] px-4 text-[14px] text-[var(--ink)] outline-none ring-1 ring-transparent focus:ring-[var(--teal)]"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-3 rounded-lg bg-[linear-gradient(173deg,#00685f_0%,#008378_100%)] py-4 text-[16px] font-semibold text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
            >
              <QrCode size={18} /> Register & Generate QR
            </button>
          </form>
        </article>

        <aside className="space-y-4">
          <h3 className="font-manrope text-[14px] font-bold uppercase tracking-[1.4px] text-[var(--muted)]">Digital ID Preview</h3>
          <article className="relative overflow-hidden rounded-2xl bg-[linear-gradient(148deg,#115e59_0%,#042f2e_100%)] p-8 text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-xl bg-[rgba(0,104,95,0.2)] blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-xl bg-[rgba(45,212,191,0.1)] blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded bg-white/10"><ShieldCheck size={16} /></span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[-0.5px] opacity-70">Clinical Intel</p>
                    <p className="text-[12px] font-semibold">SMART HEALTH PASS</p>
                  </div>
                </div>
                <span className="rounded-sm bg-white/20 px-2 py-0.5 text-[10px] font-semibold">EMERGENCY ACCESS</span>
              </div>

              <div className="mt-10 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.8px] opacity-60">Patient Name</p>
                  <p className="font-manrope text-[20px] font-bold">{cardName}</p>
                  <div className="mt-4 flex gap-8">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.8px] opacity-60">Blood Type</p>
                      <p className="text-[14px] font-semibold">{cardBlood}</p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.8px] opacity-60">ID Reference</p>
                      <p className="text-[14px] font-semibold">{cardId}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded bg-white p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                  <div className="grid h-20 w-20 place-items-center border-2 border-[#f1f5f9] bg-[#f8fafc]"><QrCode size={34} className="text-[#0f172a]" /></div>
                  <p className="mt-1 text-center text-[6px] font-semibold text-[#0f172a]">SCAN ME</p>
                </div>
              </div>
              <p className="mt-4 flex items-center justify-center gap-1 text-[8px] font-semibold opacity-30"><IdCard size={9} /> NFC ENABLED</p>
            </div>
          </article>

          <article className="rounded-lg border border-[rgba(188,201,198,0.2)] bg-[var(--surface-2)] px-[25px] pb-[25px] pt-[41px]">
            <p className="flex items-center gap-2 text-[12px] font-semibold text-[var(--muted)]"><Search size={12} />SYSTEM CHECK & DUPLICATE PREVENTION</p>
            <div className="mt-4 space-y-3">
              {statusChecks.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded bg-white/50 p-3">
                  <div className="flex items-center gap-3">
                    {item.id === 'identity' ? <Search size={16} className="text-[var(--teal)]" /> : <BellRing size={16} className="text-[var(--teal)]" />}
                    <div>
                      <p className="text-[12px] font-semibold text-[var(--ink)]">{item.title}</p>
                      <p className="text-[10px] text-[var(--slate-500)]">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className={`rounded-sm px-2 py-1 text-[10px] font-semibold ${item.state === 'secure' ? 'bg-[#f0fdfa] text-[#0d9488]' : 'bg-[#f1f5f9] text-[var(--slate-400)]'}`}>
                    {item.state.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-[rgba(137,245,231,0.3)] p-4">
              <p className="flex gap-3 text-[11px] leading-[17.88px] text-[#005049]"><AlertCircle size={18} className="mt-0.5 shrink-0" />This patient profile will be encrypted using 256-bit AES protocol. The generated QR code allows emergency first responders to view vital medical info without logging into the portal.</p>
            </div>
          </article>
        </aside>
      </section>
    </motion.div>
  )
}
