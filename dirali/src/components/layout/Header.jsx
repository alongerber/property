import useStore from '../../store/useStore';
import { formatCurrency } from '../../utils/calculations';

export default function Header() {
  const totalEquity = useStore((s) => s.totalEquity);

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-4"
      style={{
        height: 56,
        backgroundColor: '#0F172A',
        borderBottom: '1px solid #334155',
      }}
    >
      {/* Right side in RTL: Logo */}
      <div className="flex items-center gap-2">
        <span
          className="text-xl font-bold"
          style={{ color: '#3B82F6' }}
        >
          &#x25C8; דירה לי
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
        <span className="ml-1 text-xs">&#x25CF;</span>
        {formatCurrency(totalEquity())}
      </div>
    </header>
  );
}
