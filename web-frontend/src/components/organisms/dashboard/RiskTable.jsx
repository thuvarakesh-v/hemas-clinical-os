const badgeClass = {
  High: 'bg-[#ffdad6] text-[#93000a]',
  Moderate: 'bg-[#ffdbce] text-[#370e00]',
  Low: 'bg-[#99f6e4] text-[#065f46]',
}

export default function RiskTable({ rows, onDetails }) {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-manrope text-[20px] font-extrabold leading-7 text-[var(--ink)]">Risk Cluster Segmentation</h2>
        <div className="flex items-center gap-4 text-[12px] font-semibold text-[var(--slate-500)]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--red)]" />Critical</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--amber)]" />Moderate</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--teal)]" />Low</span>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-0 text-left">
          <thead>
            <tr className="border-b border-[var(--line)]">
              <th className="pb-4 pr-6 text-[10px] uppercase tracking-[1px] text-[var(--muted)]">Demographic Cluster</th>
              <th className="pb-4 px-6 text-center text-[10px] uppercase tracking-[1px] text-[var(--muted)]">Population</th>
              <th className="pb-4 px-6 text-center text-[10px] uppercase tracking-[1px] text-[var(--muted)]">Risk Index</th>
              <th className="pb-4 px-6 text-center text-[10px] uppercase tracking-[1px] text-[var(--muted)]">Primary Concern</th>
              <th className="pb-4 pl-6 text-right text-[10px] uppercase tracking-[1px] text-[var(--muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.cluster} className={index > 0 ? 'border-t border-[rgba(242,244,246,0.3)]' : ''}>
                <td className="py-6 pr-6 text-[14px] font-semibold leading-5 text-[var(--ink)]">{row.cluster}</td>
                <td className="px-6 py-6 text-center text-[14px] leading-5 text-[var(--muted)]">{row.population}</td>
                <td className="px-6 py-6 text-center">
                  <span className={`inline-flex rounded-xl px-3 py-0.5 text-[10px] font-semibold leading-5 ${badgeClass[row.risk]}`}>
                    {row.risk}
                  </span>
                </td>
                <td className="px-6 py-6 text-center text-[14px] leading-5 text-[var(--muted)]">{row.concern}</td>
                <td className="py-6 pl-6 text-right">
                  <button
                    onClick={() => onDetails(row)}
                    className="rounded px-3 py-1 text-[14px] font-semibold leading-5 text-[var(--teal)] transition hover:bg-[rgba(0,104,95,0.06)]"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
