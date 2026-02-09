import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Wallet,
  GitCompare,
  CheckSquare,
  Bot,
} from 'lucide-react';

const tabs = [
  { to: '/', label: 'דשבורד', icon: LayoutDashboard },
  { to: '/properties', label: 'נכסים', icon: Building2 },
  { to: '/equity', label: 'הון עצמי', icon: Wallet },
  { to: '/compare', label: 'השוואה', icon: GitCompare },
  { to: '/tasks', label: 'משימות', icon: CheckSquare },
  { to: '/ai', label: 'AI', icon: Bot },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-around"
      style={{
        backgroundColor: '#0F172A',
        borderTop: '1px solid #334155',
        height: 56,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1"
          style={({ isActive }) => ({
            color: isActive ? '#3B82F6' : '#64748B',
            textDecoration: 'none',
          })}
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span
                className="text-[10px] leading-tight font-medium"
                style={{ color: isActive ? '#3B82F6' : '#64748B' }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
