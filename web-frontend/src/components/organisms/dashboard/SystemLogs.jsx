import PrimaryButton from '../../atoms/PrimaryButton'

const toneMap = {
  red: {
    line: 'bg-[var(--red)]',
    label: 'text-[var(--red)]',
  },
  teal: {
    line: 'bg-[var(--teal)]',
    label: 'text-[var(--teal)]',
  },
  amber: {
    line: 'bg-[var(--amber)]',
    label: 'text-[var(--amber)]',
  },
  slate: {
    line: 'bg-[#e2e8f0]',
    label: 'text-[var(--slate-400)]',
  },
}

export default function SystemLogs({ logs, onViewAll }) {
  return (
    <aside className="rounded-3xl bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <h2 className="font-manrope text-[20px] font-extrabold leading-7 text-[var(--ink)]">System Logs</h2>
      <div className="mt-6 space-y-6">
        {logs.map((log) => {
          const tone = toneMap[log.tone]
          return (
            <div key={log.id} className="flex h-[79px] gap-4">
              <div className={`w-[2.7px] rounded-xl ${tone.line}`} />
              <div>
                <p className={`text-[12px] font-semibold uppercase tracking-[1.2px] ${tone.label}`}>{log.label}</p>
                <p className="mt-1 text-[14px] font-semibold leading-5 text-[var(--ink)]">{log.message}</p>
                <p className="mt-1 text-[10px] leading-[15px] text-[var(--slate-400)]">{log.time}</p>
              </div>
            </div>
          )
        })}
      </div>
      <PrimaryButton onClick={onViewAll} className="mt-2 h-[48px] w-full text-[14px] text-[var(--slate-500)]" tone="default">
        View All Logs
      </PrimaryButton>
    </aside>
  )
}
