import { motion } from 'framer-motion'
import { insights, logs, riskRows, stats, trendPoints } from '../../data/mockData'
import InsightBanner from '../organisms/dashboard/InsightBanner'
import StatCard from '../organisms/dashboard/StatCard'
import TrendChart from '../organisms/dashboard/TrendChart'
import HeatmapCard from '../organisms/dashboard/HeatmapCard'
import RiskTable from '../organisms/dashboard/RiskTable'
import SystemLogs from '../organisms/dashboard/SystemLogs'

export default function DashboardPage({ onOpenModal, interval, onIntervalChange }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.32 }}
			className="space-y-6 md:space-y-8"
		>
			<section className="flex flex-col items-start justify-between gap-4 2xl:flex-row 2xl:items-end">
				<div>
					<h1 className="font-manrope text-[30px] font-extrabold leading-[36px] tracking-[-0.75px] text-[var(--ink)]">
						Clinical Intelligence Dashboard
					</h1>
					<p className="text-[16px] leading-6 text-[var(--muted)]">
						Global Population Health and Risk Analytics |{' '}
						<span className="font-semibold text-[var(--teal)]">Real-time Data Active</span>
					</p>
				</div>
				<InsightBanner lines={insights} />
			</section>

			<section className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-4">
				{stats.map((item) => (
					<StatCard key={item.id} item={item} />
				))}
			</section>

			<section className="grid grid-cols-1 gap-8 2xl:grid-cols-[2fr_1fr]">
				<TrendChart points={trendPoints} interval={interval} onIntervalChange={onIntervalChange} />
				<HeatmapCard />
			</section>

			<section className="grid grid-cols-1 gap-8 2xl:grid-cols-[3fr_1fr]">
				<RiskTable rows={riskRows} onDetails={(row) => onOpenModal('Risk Details', `${row.cluster} | ${row.concern} risk profile selected.`)} />
				<SystemLogs logs={logs} onViewAll={() => onOpenModal('System Logs', 'A full audit timeline is available in the next release panel.')} />
			</section>
		</motion.div>
	)
}
