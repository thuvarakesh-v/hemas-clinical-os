import { motion } from 'framer-motion'

export default function PrimaryButton({ children, className = '', onClick, type = 'button', tone = 'default' }) {
  const tones = {
    default: 'bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)]',
    danger: 'bg-[var(--red-soft)] text-[var(--red-strong)]',
    dark: 'bg-[var(--ink)] text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]',
    plain: 'bg-transparent text-[var(--teal)]',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-[12px] font-semibold leading-4 transition hover:brightness-[0.98] ${tones[tone]} ${className}`}
    >
      {children}
    </motion.button>
  )
}
