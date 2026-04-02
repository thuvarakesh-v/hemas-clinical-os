import { Bell, ChevronDown } from 'lucide-react'
import SearchInput from '../molecules/SearchInput'
import TopbarTabs from '../molecules/TopbarTabs'
import PrimaryButton from '../atoms/PrimaryButton'

export default function Topbar({
  query,
  onQueryChange,
  tabs,
  activeTab,
  onTabChange,
  onEmergencyAlert,
  onProfileMenu,
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[rgba(241,245,249,0.5)] bg-[rgba(255,255,255,0.82)] px-4 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] md:px-6 xl:px-8">
      <div className="flex items-center gap-4 xl:gap-8">
        <SearchInput value={query} onChange={onQueryChange} placeholder="Patient Lookup..." />
        <TopbarTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      <div className="flex items-center gap-4">
        <PrimaryButton tone="danger" onClick={onEmergencyAlert} className="hidden text-[12px] md:inline-flex">
          Emergency Alert
        </PrimaryButton>
        <div className="flex items-center gap-3 border-l border-(--line) pl-4">
          <button onClick={onProfileMenu} className="text-(--slate-500) transition hover:text-(--ink)">
            <Bell size={18} />
          </button>
          <button onClick={onProfileMenu} className="flex items-center gap-2">
            <img
              src="https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&w=96&q=80"
              alt="Doctor avatar"
              className="h-8 w-8 rounded-xl object-cover"
            />
            <span className="hidden text-[14px] font-semibold leading-5 text-[#115e59] sm:inline">Dr. Moore</span>
            <ChevronDown size={14} className="hidden text-(--slate-500) sm:inline" />
          </button>
        </div>
      </div>
    </header>
  )
}
