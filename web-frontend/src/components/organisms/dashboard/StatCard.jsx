import { Activity, AlertTriangle, ShieldAlert, TrendingUp } from 'lucide-react'

const iconMap = {
  active: Activity,
  risk: AlertTriangle,
  alerts: ShieldAlert,
  recovered: TrendingUp,
}

const toneMap = {
  teal: {
    chip: 'bg-[rgba(0,104,95,0.05)] text-[var(--teal)]',
    bar: 'bg-[var(--teal)]',
    icon: 'bg-[rgba(0,131,120,0.1)] text-[var(--teal)]',
  },
  amber: {
    chip: 'bg-[rgba(146,70,40,0.08)] text-[var(--amber)]',
    bar: 'bg-[var(--amber)]',
    icon: 'bg-[rgba(146,70,40,0.1)] text-[var(--amber)]',
  },
  red: {
    chip: 'bg-[rgba(186,26,26,0.08)] text-[var(--red)]',
    bar: 'bg-[var(--red)]',
    icon: 'bg-[rgba(186,26,26,0.1)] text-[var(--red)]',
  },
  slate: {
    chip: 'bg-[rgba(84,95,115,0.08)] text-[var(--slate-600)]',
    bar: 'bg-[var(--slate-600)]',
    icon: 'bg-[rgba(84,95,115,0.1)] text-[var(--slate-600)]',
  },
}

export default function StatCard({ item }) {
  const Icon = iconMap[item.id]
  const tone = toneMap[item.tone]

  return (
    <article className="h-full rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${tone.icon}`}>
          <Icon size={18} />
        </div>
        <span className={`rounded-xl px-2 py-1 text-[12px] font-semibold leading-4 ${tone.chip}`}>{item.delta}</span>
      </div>
      <h3 className="mt-7 text-[12px] font-semibold uppercase tracking-[1.2px] text-[var(--muted)]">{item.title}</h3>
      <p className="mt-1 font-manrope text-[42px] font-extrabold leading-[1] tracking-[-0.9px] text-[var(--ink)] sm:text-[30px]">{item.value}</p>
      <div className="mt-5 h-1 overflow-hidden rounded-xl bg-[var(--surface-2)]">
        <div className={`h-full ${tone.bar}`} style={{ width: `${item.progress}%` }} />
      </div>
    </article>
  )
}
