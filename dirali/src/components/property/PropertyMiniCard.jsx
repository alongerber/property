import { motion } from 'framer-motion';
import { calcTax, calcMortgage, formatCurrency, getIncomeRatio, getIncomeRatioColor } from '../../utils/calculations';
import StatusPill from './StatusPill';

export default function PropertyMiniCard({
  property,
  mortgageYears,
  mortgageRate,
  totalEquity,
  netIncome,
}) {
  const {
    name,
    street,
    price,
    color = '#3B82F6',
    emoji,
    images = [],
    rooms,
    sqm,
    garden_sqm,
    parking,
    status,
  } = property;

  const primaryImage = images?.[0];
  const tax = calcTax(price);
  const mortgagePrincipal = Math.max(0, price + tax - totalEquity);
  const monthlyPayment = calcMortgage(mortgagePrincipal, mortgageRate, mortgageYears);
  const ratio = getIncomeRatio(monthlyPayment, netIncome);
  const ratioColor = getIncomeRatioColor(ratio);

  return (
    <motion.div
      className="rounded-2xl p-4 cursor-pointer"
      style={{
        backgroundColor: '#1E293B',
        border: `1px solid ${color}33`,
      }}
      whileHover={{ y: -2, boxShadow: `0 8px 24px ${color}15` }}
      transition={{ duration: 0.2 }}
      dir="rtl"
    >
      {/* Top row: image/emoji + name + price */}
      <div className="flex items-start gap-3 mb-3">
        {/* Image or emoji fallback */}
        <div
          className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: `${color}22` }}
        >
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl">
              {emoji || name?.charAt(0) || '?'}
            </span>
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
            {formatCurrency(price)}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div
        className="flex items-center gap-2 text-xs flex-wrap mb-3"
        style={{ color: '#94A3B8' }}
      >
        {rooms != null && (
          <span className="flex items-center gap-1">
            <span style={{ color: '#64748B' }}>{rooms}</span> \u05D7\u05D3\u05E8\u05D9\u05DD
          </span>
        )}
        {sqm != null && (
          <>
            <span style={{ color: '#334155' }}>|</span>
            <span className="flex items-center gap-1">
              <span style={{ color: '#64748B' }}>{sqm}</span> \u05DE\u0022\u05E8
            </span>
          </>
        )}
        {garden_sqm != null && garden_sqm > 0 && (
          <>
            <span style={{ color: '#334155' }}>|</span>
            <span className="flex items-center gap-1">
              {'🌱'} <span style={{ color: '#64748B' }}>{garden_sqm}</span>
            </span>
          </>
        )}
        {parking != null && parking > 0 && (
          <>
            <span style={{ color: '#334155' }}>|</span>
            <span className="flex items-center gap-1">
              {'🅿️'} <span style={{ color: '#64748B' }}>{parking}</span>
            </span>
          </>
        )}
      </div>

      {/* Status pill */}
      <div className="mb-3">
        <StatusPill status={status} size="sm" />
      </div>

      {/* Monthly mortgage + income ratio */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: '1px solid #334155' }}
      >
        <div>
          <p className="text-xs" style={{ color: '#64748B' }}>
            \u05D4\u05D7\u05D6\u05E8 \u05D7\u05D5\u05D3\u05E9\u05D9
          </p>
          <p
            className="text-sm font-mono font-semibold"
            style={{ color: '#E2E8F0' }}
          >
            {formatCurrency(Math.round(monthlyPayment))}
          </p>
        </div>

        <div className="text-left">
          <p className="text-xs" style={{ color: '#64748B' }}>
            \u05D0\u05D7\u05D5\u05D6 \u05DE\u05D4\u05DB\u05E0\u05E1\u05D4
          </p>
          <p
            className="text-sm font-mono font-bold"
            style={{ color: ratioColor }}
          >
            {ratio.toFixed(1)}%
          </p>
        </div>
      </div>
    </motion.div>
  );
}
