import { AppIcon } from '../atoms/AppIcon'

export default function SearchInput({ value, onChange, placeholder }) {
  return (
    <label className="relative block w-full max-w-[256px]">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)]">
        <AppIcon name="Search" size={17} />
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-[42px] w-full rounded-xl bg-[var(--surface-2)] pl-10 pr-4 text-[14px] text-[var(--slate-700)] outline-none ring-[1px] ring-transparent transition focus:ring-[var(--teal)]"
      />
    </label>
  )
}
