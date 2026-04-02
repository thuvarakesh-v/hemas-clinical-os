import { AppIcon } from '../../atoms/AppIcon'
import PrimaryButton from '../../atoms/PrimaryButton'

export default function QuickActionFab({ mode = 'default', isOpen, onToggle, onCreateAlert, onCreateTask }) {
  const isSosMode = mode === 'sos'
  const isHidden = mode === 'hidden'

  if (isHidden) return null

  return (
    <div className="fixed bottom-20 right-4 z-30 xl:bottom-8 xl:right-8">
      {!isSosMode && isOpen && (
        <div className="mb-3 w-56 rounded-xl border border-[var(--line)] bg-white p-3 shadow-lg">
          <button
            className="mb-1 w-full rounded-lg px-3 py-2 text-left text-[14px] font-semibold text-[var(--ink)] hover:bg-[var(--surface-2)]"
            onClick={onCreateAlert}
          >
            Trigger Incident Alert
          </button>
          <button
            className="w-full rounded-lg px-3 py-2 text-left text-[14px] font-semibold text-[var(--ink)] hover:bg-[var(--surface-2)]"
            onClick={onCreateTask}
          >
            Create Follow-up Task
          </button>
        </div>
      )}
      <PrimaryButton
        tone={isSosMode ? 'plain' : 'dark'}
        onClick={onToggle}
        className={`h-14 w-14 rounded-xl p-0 ${isSosMode ? 'bg-[#ba1a1a] text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]' : ''}`}
      >
        <AppIcon name={isSosMode ? 'Bell' : 'Plus'} size={16} />
      </PrimaryButton>
    </div>
  )
}
