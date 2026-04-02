import { motion } from 'framer-motion'
import { BriefcaseMedical, KeyRound, ShieldAlert, Siren, Stethoscope, UserRound, UserCog, Eye, EyeOff, CircleCheck, Circle, Camera } from 'lucide-react'
import { memberRoleOptions, rolePermissionCopy } from '../../../data/addMemberData'

const roleIcons = {
  doctor: Stethoscope,
  nurse: BriefcaseMedical,
  sos: Siren,
  admin: UserCog,
}

function RoleButton({ option, active, onClick }) {
  const Icon = roleIcons[option.icon]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-3 rounded-lg px-4 py-4 text-[12px] font-semibold transition ${
        active
          ? 'bg-[#f0fdfa] text-[#115e59] ring-2 ring-[rgba(13,148,136,0.3)]'
          : 'bg-[#f2f4f6] text-[#3d4947] hover:bg-[#eceff1]'
      }`}
    >
      <Icon size={18} />
      {option.label}
    </button>
  )
}

function LabelField({ label, value, onChange, placeholder, type = 'text', rightIcon, onRightIconClick }) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold leading-4 text-[var(--muted)]">{label}</span>
      <div className="relative mt-1">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded bg-[#f2f4f6] px-3 text-[14px] text-[var(--ink)] outline-none ring-1 ring-transparent transition focus:ring-[rgba(0,104,95,0.35)]"
        />
        {rightIcon ? (
          <button type="button" onClick={onRightIconClick} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)]">
            {rightIcon}
          </button>
        ) : null}
      </div>
    </label>
  )
}

export default function AddMemberContent({
  role,
  setRole,
  form,
  updateField,
  showPassword,
  onTogglePassword,
  onCancel,
  onCreateAccount,
  dirty,
  onAvatarUpload,
}) {
  const permission = rolePermissionCopy[role]

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-8">
      <section className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-manrope text-[30px] font-extrabold tracking-[-0.75px] text-[var(--ink)]">Add New Member</h1>
          <p className="mt-2 max-w-[470px] text-[16px] leading-6 text-[var(--muted)]">
            Provision credentials and define access levels for clinical staff within the framework.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg px-5 py-2 text-[14px] font-semibold text-[#545f73] hover:bg-[#eef1f4]">
            Cancel
          </button>
          <button
            type="button"
            onClick={onCreateAccount}
            className="rounded-lg bg-[linear-gradient(166deg,#00685f_0%,#008378_100%)] px-6 py-2 text-[14px] font-semibold text-white shadow-[0_10px_15px_-3px_rgba(0,104,95,0.2),0_4px_6px_-4px_rgba(0,104,95,0.2)]"
          >
            Create Account
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="space-y-6">
          <article className="rounded-lg bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="grid h-24 w-24 place-items-center rounded-xl bg-[#e6e8ea] text-[#6d7a77]">
                  <UserRound size={24} />
                </div>
                <button
                  type="button"
                  onClick={onAvatarUpload}
                  className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-xl bg-[#00685f] text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
                >
                  <Camera size={13} />
                </button>
              </div>
              <div>
                <h2 className="font-manrope text-[18px] font-bold text-[var(--ink)]">Profile Identity</h2>
                <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[var(--muted)]">Member Information</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <LabelField
                label="Full Name"
                value={form.fullName}
                onChange={(value) => updateField('fullName', value)}
                placeholder="e.g. Dr. Helena Thorne"
              />
              <LabelField
                label="Employee ID"
                value={form.employeeId}
                onChange={(value) => updateField('employeeId', value)}
                placeholder="ETH-9920-X"
              />
              <LabelField
                label="Mobile Number"
                value={form.mobileNumber}
                onChange={(value) => updateField('mobileNumber', value)}
                placeholder="+1 (555) 000-0000"
              />
              <LabelField
                label="Password"
                value={form.password}
                onChange={(value) => updateField('password', value)}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                rightIcon={showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                onRightIconClick={onTogglePassword}
              />
            </div>
          </article>

          <article className="rounded-lg bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h3 className="font-manrope text-[18px] font-bold text-[var(--ink)]">Organizational Role</h3>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {memberRoleOptions.map((option) => (
                <RoleButton key={option.id} option={option} active={role === option.id} onClick={() => setRole(option.id)} />
              ))}
            </div>
          </article>
        </div>

        <aside className="space-y-6">
          <article className="relative overflow-hidden rounded-lg bg-[#111c2d] p-8 text-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
            <div className="pointer-events-none absolute -right-4 -top-4 h-28 w-20 rounded-b-[44px] rounded-t-[24px] bg-[rgba(148,163,184,0.2)]" />
            <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#89f5e7]">Permission Matrix</p>
            <h4 className="mt-1 font-manrope text-[32px] max-sm:text-[20px] font-bold leading-7">{permission.title}</h4>

            <div className="mt-6 space-y-4">
              {permission.points.map((point) => (
                <div key={point.label} className={`flex items-start gap-3 ${point.enabled ? '' : 'opacity-40'}`}>
                  {point.enabled ? <CircleCheck size={15} className="mt-0.5 text-[#89f5e7]" /> : <Circle size={15} className="mt-0.5 text-[#94a3b8]" />}
                  <div>
                    <p className="text-[14px] font-semibold leading-5">{point.label}</p>
                    <p className="text-[12px] leading-4 text-[rgba(216,227,251,0.7)]">{point.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-4 backdrop-blur-[2px]">
              <p className="text-[12px] font-medium leading-4 text-[rgba(216,227,251,0.8)]">{permission.quote}</p>
            </div>
          </article>

          <article className="rounded-lg bg-[#f2f4f6] p-6">
            <h5 className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--ink)]">
              <ShieldAlert size={14} className="text-[#924628]" /> Compliance Note
            </h5>
            <p className="mt-3 text-[12px] leading-[19.5px] text-[var(--muted)]">
              Creating this account will trigger an automated verification email. All access is logged under HIPAA-compliant auditing protocols.
            </p>
          </article>
        </aside>
      </section>

      <section className="flex flex-col items-start justify-between gap-3 border-t border-[#eceef0] pt-8 sm:flex-row sm:items-center">
        <p className="inline-flex items-center gap-2 text-[12px] font-medium text-[var(--muted)]">
          <KeyRound size={12} /> {dirty ? 'Pending unsaved changes...' : 'All changes saved.'}
        </p>
        <button
          type="button"
          onClick={onCreateAccount}
          className="rounded-lg bg-[linear-gradient(166deg,#00685f_0%,#008378_100%)] px-8 py-3 text-[14px] font-semibold text-white shadow-[0_10px_15px_-3px_rgba(0,104,95,0.2),0_4px_6px_-4px_rgba(0,104,95,0.2)]"
        >
          Create Account
        </button>
      </section>
    </motion.div>
  )
}
