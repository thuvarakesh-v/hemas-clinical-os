import { useMemo } from 'react'
import PrimaryButton from '../../atoms/PrimaryButton'

const intervals = ['Daily', 'Weekly', 'Monthly']

export default function TrendChart({ points, interval, onIntervalChange }) {
  const maxValue = useMemo(() => Math.max(...points.map((point) => point.value)), [points])

  return (
    <section className="rounded-3xl bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-manrope text-[20px] font-extrabold leading-7 text-(--ink)">Epidemiological Trends</h2>
          <p className="text-[14px] leading-5 text-(--muted)">Comparative analysis of regional outbreaks</p>
        </div>
        <div className="flex gap-2">
          {intervals.map((name) => (
            <PrimaryButton
              key={name}
              onClick={() => onIntervalChange(name)}
              className={`rounded px-3 py-1 text-[12px] border ${
                interval === name
                  ? 'border-(--teal) bg-white text-(--teal) shadow-[0_1px_2px_rgba(0,104,95,0.12)]'
                  : 'border-transparent bg-(--surface-2) text-(--ink)'
              }`}
            >
              {name}
            </PrimaryButton>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="grid h-60 grid-cols-7 items-end gap-3 border-b border-transparent bg-[linear-gradient(to_top,var(--line)_1px,transparent_1px)] bg-size-[100%_60px] px-4 pb-4 pt-10">
          {points.map((point, index) => {
            const height = `${(point.value / maxValue) * 100}%`
            const barClass =
              index === 3
                ? 'bg-[#008378]'
                : index === 6
                  ? 'bg-[var(--peach)]'
                  : index % 2
                    ? 'bg-[rgba(0,104,95,0.4)]'
                    : 'bg-[rgba(0,104,95,0.24)]'

            return (
              <div key={point.day} className="group relative flex h-full items-end">
                <div
                  className={`mx-auto w-full rounded-t-lg transition duration-300 group-hover:brightness-110 ${barClass}`}
                  style={{ height }}
                  title={point.display}
                />
                <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-(--ink) px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                  {point.display}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-3 px-4">
          {points.map((point) => (
            <span key={point.day} className="text-center text-[10px] font-semibold uppercase tracking-[1px] text-(--slate-400)">
              {point.day}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
