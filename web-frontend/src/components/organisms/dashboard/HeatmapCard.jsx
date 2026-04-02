export default function HeatmapCard() {
  return (
    <section className="rounded-3xl bg-[var(--navy)] p-8 text-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
      <h2 className="font-manrope text-[20px] font-extrabold leading-7">Regional Heatmap</h2>
      <p className="mt-1 text-[14px] leading-5 text-[var(--slate-400)]">Patient Density and Risk clusters</p>

      <div className="mt-6 h-[251px] overflow-hidden rounded-2xl border border-[#334155] bg-[radial-gradient(circle_at_30%_25%,rgba(186,26,26,0.55),transparent_24%),radial-gradient(circle_at_72%_72%,rgba(0,104,95,0.45),transparent_30%),linear-gradient(120deg,#091328_0%,#0b1731_55%,#0a1427_100%)] p-5">
        <div className="relative h-full rounded border border-[#1e293b]">
          <div className="absolute left-[14%] top-[18%] h-12 w-12 rounded-xl bg-[rgba(186,26,26,0.42)] blur-xl" />
          <div className="absolute bottom-[16%] right-[12%] h-20 w-20 rounded-xl bg-[rgba(0,104,95,0.36)] blur-xl" />
          <div className="absolute left-[36%] top-[53%] h-3 w-3 rounded-full bg-[var(--red)] shadow-[0_0_0_4px_rgba(186,26,26,0.35)]" />
          <div className="absolute left-[39%] top-[61%] rounded bg-[#1e293b] px-2 py-1 text-[10px] leading-[15px] text-white">
            Cluster 04: Respiratory (+18%)
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-4 text-[10px] font-semibold uppercase tracking-[1px] text-[var(--slate-400)]">
          <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--red)]" />High Risk</div>
          <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--teal)]" />Stable</div>
        </div>
        <button className="text-[12px] font-semibold text-[#89f5e7]">Full Analytics</button>
      </div>
    </section>
  )
}
