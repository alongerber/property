import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Bot,
  CheckSquare,
  Settings,
} from 'lucide-react';
import useStore from '../../store/useStore';

const tabs = [
  { to: '/', label: 'דשבורד', icon: LayoutDashboard },
  { to: '/properties', label: 'נכסים', icon: Building2 },
  { to: '/ai', label: 'AI', icon: Bot },
  { to: '/tasks', label: 'משימות', icon: CheckSquare },
  { to: '/settings', label: 'הגדרות', icon: Settings },
];

export default function BottomNav() {
  const tasks = useStore((s) => s.tasks);
  const overdueCount = tasks.filter(
    (t) => !t.is_done && t.due_date && new Date(t.due_date) < new Date()
  ).length;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-around"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(51, 65, 85, 0.6)',
        height: 56,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          aria-label={label}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative"
          style={({ isActive }) => ({
            color: isActive ? '#3B82F6' : '#64748B',
            textDecoration: 'none',
          })}
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 1.8} />
                {to === '/tasks' && overdueCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2.5 flex items-center justify-center text-[9px] font-bold rounded-full"
                    style={{
                      width: 16,
                      height: 16,
                      backgroundColor: '#EF4444',
                      color: '#fff',
                      boxShadow: '0 0 6px rgba(239, 68, 68, 0.5)',
                    }}
                  >
                    {overdueCount > 9 ? '9+' : overdueCount}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] leading-tight font-medium"
                style={{ color: isActive ? '#3B82F6' : '#64748B' }}
              >
                {label}
              </span>
              {isActive && (
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: '#3B82F6',
                    boxShadow: '0 0 6px 2px rgba(59, 130, 246, 0.5)',
                    marginTop: 1,
                  }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
