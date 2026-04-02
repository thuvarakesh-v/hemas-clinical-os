import { NavLink } from 'react-router-dom'
import { AppIcon } from '../../atoms/AppIcon'

export default function MobileBottomNav({ items }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--line)] bg-white/95 px-2 py-2 backdrop-blur xl:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.slice(0, 5).map((item) => (
          <NavLink
            key={item.id}
            to={item.route}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-semibold transition ${
                isActive ? 'text-[var(--teal)] bg-[rgba(0,104,95,0.08)]' : 'text-[var(--slate-500)]'
              }`
            }
          >
            <AppIcon name={item.icon} size={16} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
