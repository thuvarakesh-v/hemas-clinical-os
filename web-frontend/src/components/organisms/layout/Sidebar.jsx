import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AppIcon } from '../../atoms/AppIcon'

export default function Sidebar({ items, onHelpClick, onSettingsClick }) {
  const location = useLocation()
  const [activeUtility, setActiveUtility] = useState(null)

  useEffect(() => {
    setActiveUtility(null)
  }, [location.pathname])

  const activeItemClass = 'bg-white text-[#0f766e] shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
  const inactiveItemClass = 'text-[var(--slate-500)] hover:bg-white/70'

  return (
    <aside className="hidden h-screen w-64 flex-col justify-between overflow-hidden border-r border-[rgba(241,245,249,0.5)] bg-[#f8fafc] p-4 xl:sticky xl:top-0 xl:flex xl:self-start">
      <div>
        <div className="px-4 pb-10">
          <h1 className="font-manrope text-[20px] font-extrabold leading-7 tracking-[-1px] text-[#134e4a]">Clinical Framework</h1>
          <p className="text-[14px] font-semibold leading-5 tracking-[-0.35px] text-[#0d9488]">Precision Care</p>
        </div>

        <nav className="space-y-1.5">
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.route}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded px-4 py-3 text-[14px] font-semibold tracking-[-0.35px] transition ${
                    isActive ? activeItemClass : inactiveItemClass
                }`
              }
            >
              <AppIcon name={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => {
            setActiveUtility('help')
            onHelpClick()
          }}
          className={`flex w-full items-center gap-3 rounded px-4 py-2 text-[14px] font-semibold transition ${
            activeUtility === 'help' ? activeItemClass : inactiveItemClass
          }`}
        >
          <AppIcon name="HelpCircle" size={18} /> Help Center
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveUtility('settings')
            onSettingsClick()
          }}
          className={`flex w-full items-center gap-3 rounded px-4 py-2 text-[14px] font-semibold transition ${
            activeUtility === 'settings' ? activeItemClass : inactiveItemClass
          }`}
        >
          <AppIcon name="Settings" size={18} /> Settings
        </button>
      </div>
    </aside>
  )
}
