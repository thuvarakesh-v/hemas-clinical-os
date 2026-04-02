export default function TopbarTabs({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="hidden h-16.5 items-start gap-6 md:flex">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`whitespace-nowrap pb-5.5 pt-5 text-[16px] leading-6 transition ${
            activeTab === tab.id
              ? 'border-b-2 border-[#0d9488] font-semibold text-[#0d9488]'
              : 'font-normal text-(--slate-500)'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
