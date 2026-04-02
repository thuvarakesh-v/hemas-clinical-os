import {
  Bell,
  BrainCircuit,
  CircleUserRound,
  FlaskConical,
  HelpCircle,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Stethoscope,
  UserCog,
  Users,
} from 'lucide-react'

const iconMap = {
  LayoutDashboard,
  Stethoscope,
  FlaskConical,
  ShieldAlert,
  Users,
  BrainCircuit,
  UserCog,
  Search,
  Bell,
  CircleUserRound,
  HelpCircle,
  Settings,
  Plus,
}

export function AppIcon({ name, size = 18, strokeWidth = 1.8, className = '' }) {
  const Icon = iconMap[name]
  if (!Icon) return null
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />
}
