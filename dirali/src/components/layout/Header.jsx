import { Diamond, TrendingUp } from 'lucide-react';
import useStore from '../../store/useStore';
import { formatCurrency } from '../../utils/calculations';

export default function Header() {
  const totalEquity = useStore((s) => s.totalEquity);

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-4"
      style={{
        height: 56,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.6)',
      }}
    >
      {/* Right side in RTL: Logo */}
      <div className="flex items-center gap-2">
        <Diamond size={22} style={{ color: '#3B82F6' }} />
        <span
          className="text-xl font-bold"
          style={{ color: '#3B82F6' }}
        >
          דירה לי
        </span>
      </div>

      {/* Left side in RTL: Equity badge */}
      <div
        className="flex items-center px-3 py-1 text-sm font-semibold"
        style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#10B981',
          borderRadius: 9999,
          border: '1px solid rgba(16, 185, 129, 0.3)',
        }}
      >
        <TrendingUp size={14} style={{ marginLeft: 4 }} />
        {formatCurrency(totalEquity())}
      </div>
    </header>
  );
}
