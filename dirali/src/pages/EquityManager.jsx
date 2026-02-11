import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Lock, Unlock, TrendingUp, AlertTriangle } from 'lucide-react';
import useStore from '../store/useStore';
import { calcTax, calcMortgage, formatCurrency, getIncomeRatio, getIncomeRatioColor } from '../utils/calculations';
import SliderInput from '../components/shared/SliderInput';

const BOI_RECOMMENDED = 33;  // Bank of Israel recommended max
const BOI_MAX_ALLOWED = 40;  // Bank absolute ceiling

export default function EquityManager() {
  const equitySources = useStore((s) => s.equitySources);
  const totalEquity = useStore((s) => s.totalEquity);
  const updateEquitySource = useStore((s) => s.updateEquitySource);
  const properties = useStore((s) => s.properties);
  const mortgageYears = useStore((s) => s.mortgageYears);
  const mortgageRate = useStore((s) => s.mortgageRate);
  const netIncome = useStore((s) => s.netIncome);

  const total = totalEquity();

  const minTotal = useMemo(
    () => equitySources.reduce((sum, s) => sum + s.min_amount, 0),
    [equitySources]
  );
  const maxTotal = useMemo(
    () => equitySources.reduce((sum, s) => sum + s.max_amount, 0),
    [equitySources]
  );

  const activeProperties = useMemo(
    () => properties.filter((p) => p.status !== 'dropped'),
    [properties]
  );

  const impactData = useMemo(() => {
    return activeProperties.map((p) => {
      const tax = calcTax(p.price);
      const renovation = p.renovation_estimate || 0;
      const totalCost = p.price + tax + renovation;
      const mortgageAmount = Math.max(0, totalCost - total);
      const monthly = mortgageAmount > 0
        ? calcMortgage(mortgageAmount, mortgageRate, mortgageYears)
        : 0;
      const ratio = netIncome > 0 ? getIncomeRatio(monthly, netIncome) : 0;
      return { ...p, tax, renovation, totalCost, mortgageAmount, monthly, ratio };
    });
  }, [activeProperties, total, mortgageRate, mortgageYears, netIncome]);

  const confirmedCount = equitySources.filter((s) => s.is_confirmed).length;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#0B1120' }} dir="rtl">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-b-3xl px-5 pt-6 pb-7"
        style={{
          background: 'linear-gradient(135deg, #065F46 0%, #059669 50%, #10B981 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 w-40 h-40 rounded-full blur-3xl"
            style={{ backgroundColor: '#34D399' }}
          />
          <div
            className="absolute bottom-0 right-0 w-56 h-56 rounded-full blur-3xl"
            style={{ backgroundColor: '#6EE7B7' }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={20} className="text-emerald-200" />
            <span className="text-sm font-medium text-emerald-100">סה״כ הון עצמי</span>
          </div>

          <div
            className="font-mono font-bold leading-none mb-2"
            style={{ fontSize: 42, color: '#FFFFFF' }}
          >
            {formatCurrency(total)}
          </div>

          <div className="flex items-center gap-3 text-sm text-emerald-200">
            <span>מינימום: {formatCurrency(minTotal)}</span>
            <span style={{ color: '#6EE7B7' }}>|</span>
            <span>מקסימום: {formatCurrency(maxTotal)}</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div
              className="h-1.5 flex-1 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: '#FFFFFF' }}
                initial={{ width: 0 }}
                animate={{
                  width: `${maxTotal > minTotal ? ((total - minTotal) / (maxTotal - minTotal)) * 100 : 0}%`,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs text-emerald-200 font-mono">
              {confirmedCount}/{equitySources.length} מאושר
            </span>
          </div>
        </div>
      </motion.div>

      {/* Source cards */}
      <div className="px-4 mt-5 space-y-3">
        <h2 className="text-base font-bold mb-1" style={{ color: '#E2E8F0' }}>
          מקורות הון
        </h2>

        {equitySources
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((source, idx) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: '#1E293B',
                border: source.is_confirmed ? '1px solid #10B981' : '1px solid #334155',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>
                    {source.label}
                  </span>
                  {source.is_confirmed && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: '#065F46', color: '#6EE7B7' }}
                    >
                      מאושר
                    </span>
                  )}
                </div>
                <span
                  className="text-lg font-mono font-bold"
                  style={{ color: '#10B981' }}
                >
                  {formatCurrency(source.current_estimate)}
                </span>
              </div>

              {/* Note */}
              {source.notes && (
                <p className="text-xs mb-3" style={{ color: '#64748B' }}>
                  {source.notes}
                </p>
              )}

              {/* Slider */}
              <div className="mb-3">
                <SliderInput
                  label=""
                  value={source.current_estimate}
                  onChange={(val) =>
                    updateEquitySource(source.id, { current_estimate: val })
                  }
                  min={source.min_amount}
                  max={source.max_amount}
                  step={10000}
                  unit="\u20AA"
                  color={source.is_confirmed ? '#10B981' : '#3B82F6'}
                  disabled={source.is_confirmed}
                />
              </div>

              {/* Confirm toggle */}
              <button
                onClick={() =>
                  updateEquitySource(source.id, {
                    is_confirmed: !source.is_confirmed,
                  })
                }
                className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                style={{
                  backgroundColor: source.is_confirmed ? '#065F46' : '#0F172A',
                  color: source.is_confirmed ? '#6EE7B7' : '#94A3B8',
                  border: `1px solid ${source.is_confirmed ? '#10B981' : '#334155'}`,
                }}
              >
                {source.is_confirmed ? (
                  <Lock size={13} />
                ) : (
                  <Unlock size={13} />
                )}
                {source.is_confirmed ? 'נעול - לחץ לביטול נעילה' : 'לחץ לאישור ונעילה'}
              </button>
            </motion.div>
          ))}
      </div>

      {/* Impact panel */}
      <div className="px-4 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} style={{ color: '#3B82F6' }} />
          <h2 className="text-base font-bold" style={{ color: '#E2E8F0' }}>
            השפעה על נכסים
          </h2>
        </div>

        {impactData.length === 0 && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: '#1E293B' }}
          >
            <p className="text-sm" style={{ color: '#64748B' }}>
              אין נכסים פעילים להשוואה
            </p>
          </div>
        )}

        <div className="space-y-2">
          {impactData.map((p) => {
            const ratioColor = getIncomeRatioColor(p.ratio);
            const barWidth = Math.min((p.ratio / BOI_MAX_ALLOWED) * 100, 100);
            const isOverRecommended = p.ratio > BOI_RECOMMENDED;
            const isOverMax = p.ratio > BOI_MAX_ALLOWED;

            return (
              <motion.div
                key={p.id}
                layout
                className="rounded-xl p-3"
                style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>
                    {p.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-mono font-bold"
                      style={{ color: ratioColor }}
                    >
                      {p.ratio.toFixed(1)}%
                    </span>
                    {isOverMax && (
                      <AlertTriangle size={14} style={{ color: '#EF4444' }} />
                    )}
                    {isOverRecommended && !isOverMax && (
                      <AlertTriangle size={14} style={{ color: '#F59E0B' }} />
                    )}
                  </div>
                </div>

                {/* Monthly payment */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: '#94A3B8' }}>
                    החזר חודשי
                  </span>
                  <span className="text-xs font-mono" style={{ color: '#E2E8F0' }}>
                    {formatCurrency(Math.round(p.monthly))}
                  </span>
                </div>

                {/* Mortgage amount */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs" style={{ color: '#94A3B8' }}>
                    סכום משכנתא
                  </span>
                  <span className="text-xs font-mono" style={{ color: '#E2E8F0' }}>
                    {formatCurrency(p.mortgageAmount)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="relative">
                  <div
                    className="h-2.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: '#0F172A' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: ratioColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  {/* 33% recommended marker */}
                  <div
                    className="absolute top-0 h-2.5 w-px"
                    style={{
                      left: `${(BOI_RECOMMENDED / BOI_MAX_ALLOWED) * 100}%`,
                      backgroundColor: '#F59E0B',
                      opacity: 0.6,
                    }}
                  />
                  {/* 40% max marker */}
                  <div
                    className="absolute top-0 h-2.5 w-px"
                    style={{
                      left: '100%',
                      backgroundColor: '#EF4444',
                      opacity: 0.6,
                    }}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs" style={{ color: '#64748B' }}>
                      0%
                    </span>
                    <span className="text-xs" style={{ color: '#F59E0B' }}>
                      {BOI_RECOMMENDED}% מומלץ
                    </span>
                    <span className="text-xs" style={{ color: '#EF4444' }}>
                      {BOI_MAX_ALLOWED}% תקרה
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
