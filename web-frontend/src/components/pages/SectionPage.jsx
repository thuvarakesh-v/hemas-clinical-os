import { motion } from 'framer-motion'

export default function SectionPage({ title }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="rounded-3xl border border-[var(--line)] bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
    >
      <h1 className="font-manrope text-[30px] font-extrabold leading-[36px] tracking-[-0.75px] text-[var(--ink)]">{title}</h1>
      <p className="mt-2 max-w-2xl text-[16px] leading-6 text-[var(--muted)]">
        This section is connected and interactive. Use sidebar and bottom navigation to switch pages while preserving shared layout and app state.
      </p>
    </motion.section>
  )
}
