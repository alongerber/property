import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, Maximize, Trees, Car } from 'lucide-react';
import useStore from '../../store/useStore';
import { calcTax, calcMortgage, formatCurrency, getIncomeRatio, getIncomeRatioColor } from '../../utils/calculations';
import StatusPill from './StatusPill';

export default function PropertyMiniCard({ property }) {
  const navigate = useNavigate();
  const { totalEquity, mortgageYears, mortgageRate, netIncome } = useStore((s) => ({
    totalEquity: s.totalEquity(),
    mortgageYears: s.mortgageYears,
    mortgageRate: s.mortgageRate,
    netIncome: s.netIncome,
  }));

  const {
    id,
    name,
    street,
    price,
    color = '#3B82F6',
    rooms,
    sqm_built,
    sqm_garden,
    parking_spots,
    status,
    features,
    images = [],
  } = property;

  const primaryImage = images?.[0];
  const hasPrice = price != null && price > 0;

  const tax = hasPrice ? calcTax(price) : 0;
  const mortgagePrincipal = hasPrice ? Math.max(0, price + tax - totalEquity) : 0;
  const monthlyPayment = hasPrice ? calcMortgage(mortgagePrincipal, mortgageRate, mortgageYears) : 0;
  const ratio = hasPrice && netIncome > 0 ? getIncomeRatio(monthlyPayment, netIncome) : 0;
  const ratioColor = getIncomeRatioColor(ratio);

  const statItems = [
    rooms != null && { icon: Home, value: rooms, label: 'חדרים' },
    sqm_built != null && { icon: Maximize, value: sqm_built, label: 'מ״ר' },
    sqm_garden != null && sqm_garden > 0 && { icon: Trees, value: sqm_garden, label: 'גינה' },
    parking_spots != null && parking_spots > 0 && { icon: Car, value: parking_spots, label: 'חניות' },
  ].filter(Boolean);

  return (
    <motion.div
      onClick={() => navigate(`/properties/${id}`)}
      className="rounded-2xl cursor-pointer relative overflow-hidden"
      style={{
        background: 'rgba(30,41,59,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: 20,
        border: `1px solid rgba(255,255,255,0.06)`,
        backgroundImage: `linear-gradient(135deg, ${color}08 0%, transparent 60%)`,
      }}
      whileHover={{
        y: -3,
        boxShadow: `0 12px 32px ${color}20, 0 0 0 1px ${color}30`,
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      dir="rtl"
    >
      {/* Subtle gradient border glow on top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
        }}
      />

      {/* Top row: image + name + price */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}
        >
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Home size={20} style={{ color }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className="text-sm font-bold truncate"
            style={{ color: '#E2E8F0' }}
          >
            {name}
          </h4>
          {street && (
            <p
              className="text-xs truncate mt-0.5"
              style={{ color: '#94A3B8' }}
            >
              {street}
            </p>
          )}
          <p
            className="text-sm font-mono font-semibold mt-1"
            style={{ color }}
          >
            {hasPrice ? formatCurrency(price) : '—'}
          </p>
        </div>
      </div>

      {/* Stats row */}
      {statItems.length > 0 && (
        <div
          className="flex items-center gap-2 text-xs flex-wrap mb-3"
          style={{ color: '#94A3B8' }}
        >
          {statItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span
                    className="mr-1"
                    style={{ color: '#475569', fontSize: 6 }}
                  >
                    {'\u00B7'}
                  </span>
                )}
                <Icon size={13} style={{ color: '#64748B' }} />
                <span style={{ color: '#CBD5E1' }}>{item.value}</span>
                <span>{item.label}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Status pill */}
      {status && (
        <div className="mb-3">
          <StatusPill status={status} size="sm" />
        </div>
      )}

      {/* Monthly mortgage + income ratio — only when price exists */}
      {hasPrice && (
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid rgba(51,65,85,0.6)' }}
        >
          <div>
            <p className="text-xs" style={{ color: '#64748B' }}>
              החזר חודשי
            </p>
            <p
              className="text-sm font-mono font-semibold"
              style={{ color: '#E2E8F0' }}
            >
              {isNaN(monthlyPayment)
                ? '—'
                : formatCurrency(Math.round(monthlyPayment))}
            </p>
          </div>

          <div className="text-left">
            <p className="text-xs" style={{ color: '#64748B' }}>
              אחוז מהכנסה
            </p>
            <p
              className="text-sm font-mono font-bold"
              style={{ color: ratioColor }}
            >
              {isNaN(ratio) ? '—' : `${ratio.toFixed(1)}%`}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
