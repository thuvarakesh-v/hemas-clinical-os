import { Sparkles } from 'lucide-react'

export default function InsightBanner({ lines }) {
  return (
    <div className="flex max-w-[448px] gap-4 rounded-lg border-l-4 border-[var(--teal)] bg-[rgba(0,131,120,0.1)] px-4 py-4">
      <Sparkles size={18} className="mt-1 text-[var(--teal)]" />
      <p className="text-[14px] font-semibold leading-5 text-[var(--teal)]">
        AI Insight:
        <span className="ml-1 font-normal text-[var(--muted)]">{lines.join(' ')}</span>
      </p>
    </div>
  )
}
