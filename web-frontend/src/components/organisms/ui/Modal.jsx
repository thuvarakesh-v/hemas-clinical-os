import { AnimatePresence, motion } from 'framer-motion'

export default function Modal({ open, title, body, onClose, onConfirm, confirmLabel = 'Confirm' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 grid place-items-center bg-[rgba(15,23,42,0.45)] px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="font-manrope text-[24px] font-extrabold leading-8 text-[var(--ink)]">{title}</h3>
            <p className="mt-2 text-[14px] leading-5 text-[var(--muted)]">{body}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-[var(--line)] px-4 py-2 text-[14px] font-semibold text-[var(--slate-500)]"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="rounded-lg bg-[var(--teal)] px-4 py-2 text-[14px] font-semibold text-white"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
