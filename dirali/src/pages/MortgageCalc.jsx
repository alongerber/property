import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChevronDown, ChevronUp, Calculator, TrendingDown, Wallet } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import useStore from '../store/useStore';
import {
  calcTax, calcMortgage, formatCurrency, formatNumber,
  getIncomeRatio, getIncomeRatioColor, generateAmortizationSchedule,
} from '../utils/calculations';
import { PROPERTY_COLORS } from '../utils/constants';
import SliderInput from '../components/shared/SliderInput';

export default function MortgageCalc() {
  const properties = useStore((s) => s.properties);
  const totalEquity = useStore((s) => s.totalEquity);
  const mortgageYears = useStore((s) => s.mortgageYears);
  const mortgageRate = useStore((s) => s.mortgageRate);
  const setMortgageYears = useStore((s) => s.setMortgageYears);
  const setMortgageRate = useStore((s) => s.setMortgageRate);
  const netIncome = useStore((s) => s.netIncome);
  const setNetIncome = useStore((s) => s.setNetIncome);

  const activeProps = useMemo(
    () => properties.filter((p) => p.status !== 'dropped'),
    [properties]
  );

  const [selectedId, setSelectedId] = useState(activeProps[0]?.id || '');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(false);

  const equity = totalEquity();

  const selectedProp = activeProps.find((p) => p.id === selectedId) || activeProps[0];

  // Full breakdown for selected property
  const breakdown = useMemo(() => {
    if (!selectedProp) return null;
    const price = selectedProp.price;
    const tax = calcTax(price);
    const renovation = selectedProp.renovation_cost || 0;
    const totalCost = price + tax + renovation;
    const mortgageAmount = Math.max(0, totalCost - equity);
    const monthly = mortgageAmount > 0
      ? calcMortgage(mortgageAmount, mortgageRate, mortgageYears)
      : 0;
    const totalPayments = monthly * mortgageYears * 12;
    const totalInterest = totalPayments - mortgageAmount;
    const ratio = netIncome > 0 ? getIncomeRatio(monthly, netIncome) : 0;

    return {
      price,
      equity,
      tax,
      renovation,
      totalCost,
      mortgageAmount,
      monthly: Math.round(monthly),
      totalInterest: Math.round(totalInterest),
      totalPayments: Math.round(totalPayments),
      ratio,
    };
  }, [selectedProp, equity, mortgageRate, mortgageYears, netIncome]);

  // Amortization schedule
  const schedule = useMemo(() => {
    if (!breakdown || breakdown.mortgageAmount <= 0) return [];
    return generateAmortizationSchedule(breakdown.mortgageAmount, mortgageRate, mortgageYears);
  }, [breakdown, mortgageRate, mortgageYears]);

  // Chart data: principal vs interest over time
  const chartData = useMemo(() => {
    return schedule.map((row) => ({
      year: row.year,
      principal: row.principal,
      interest: row.interest,
    }));
  }, [schedule]);

  // Multi-property bar chart data
  const multiPropData = useMemo(() => {
    return activeProps.map((p, i) => {
      const tax = calcTax(p.price);
      const renovation = p.renovation_cost || 0;
      const totalCost = p.price + tax + renovation;
      const mortgageAmount = Math.max(0, totalCost - equity);
      const monthly = mortgageAmount > 0
        ? Math.round(calcMortgage(mortgageAmount, mortgageRate, mortgageYears))
        : 0;
      return {
        name: p.name,
        monthly,
        fill: PROPERTY_COLORS[i % PROPERTY_COLORS.length],
      };
    });
  }, [activeProps, equity, mortgageRate, mortgageYears]);

  const incomeThreshold = Math.round(netIncome * 0.33);

  const breakdownRows = breakdown
    ? [
        { label: 'מחיר הנכס', value: formatCurrency(breakdown.price), color: '#E2E8F0' },
        { label: 'הון עצמי', value: formatCurrency(breakdown.equity), color: '#10B981' },
        { label: 'מס רכישה', value: formatCurrency(breakdown.tax), color: '#F59E0B' },
        { label: 'שיפוצים', value: formatCurrency(breakdown.renovation), color: '#F97316' },
        { label: 'עלות כוללת', value: formatCurrency(breakdown.totalCost), color: '#E2E8F0', bold: true },
        { label: 'סכום משכנתא', value: formatCurrency(breakdown.mortgageAmount), color: '#3B82F6', bold: true },
        { label: 'החזר חודשי', value: formatCurrency(breakdown.monthly), color: getIncomeRatioColor(breakdown.ratio), bold: true },
        { label: 'סה״כ ריבית', value: formatCurrency(breakdown.totalInterest), color: '#EF4444' },
        { label: 'סה״כ עלות (כולל ריבית)', value: formatCurrency(breakdown.totalPayments + breakdown.tax + breakdown.renovation), color: '#E2E8F0' },
      ]
    : [];

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#0B1120' }} dir="rtl">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={20} style={{ color: '#3B82F6' }} />
          <h1 className="text-lg font-bold" style={{ color: '#E2E8F0' }}>
            מחשבון משכנתא
          </h1>
        </div>

        {/* Mortgage params */}
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
        >
          <SliderInput
            label="שנות משכנתא"
            value={mortgageYears}
            onChange={setMortgageYears}
            min={15}
            max={30}
            step={1}
            unit="שנים"
            color="#3B82F6"
          />
          <SliderInput
            label="ריבית שנתית"
            value={mortgageRate}
            onChange={setMortgageRate}
            min={3.0}
            max={6.5}
            step={0.1}
            unit="%"
            color="#F59E0B"
          />
        </div>
      </div>

      {/* Property selector */}
      {activeProps.length > 0 && (
        <div className="px-4 mb-4">
          <label className="text-xs font-medium block mb-1.5" style={{ color: '#94A3B8' }}>
            בחר נכס
          </label>
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm appearance-none outline-none cursor-pointer"
              style={{
                backgroundColor: '#0F172A',
                color: '#E2E8F0',
                border: '1px solid #334155',
              }}
            >
              {activeProps.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#64748B' }}
            />
          </div>
        </div>
      )}

      {/* Full breakdown */}
      {breakdown && (
        <div className="px-4 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
          >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #334155' }}>
              <div className="flex items-center gap-2">
                <Building2 size={16} style={{ color: '#3B82F6' }} />
                <h3 className="text-sm font-bold" style={{ color: '#E2E8F0' }}>
                  פירוט מלא - {selectedProp?.name}
                </h3>
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: '#334155' }}>
              {breakdownRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderColor: '#0F172A22' }}
                >
                  <span className="text-sm" style={{ color: '#94A3B8' }}>
                    {row.label}
                  </span>
                  <span
                    className={`text-sm font-mono ${row.bold ? 'font-bold' : 'font-medium'}`}
                    style={{ color: row.color }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Income ratio badge */}
            <div className="px-4 py-3" style={{ backgroundColor: '#0F172A' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#94A3B8' }}>
                  יחס החזר להכנסה
                </span>
                <span
                  className="text-sm font-mono font-bold px-3 py-1 rounded-full"
                  style={{
                    color: getIncomeRatioColor(breakdown.ratio),
                    backgroundColor: `${getIncomeRatioColor(breakdown.ratio)}15`,
                  }}
                >
                  {breakdown.ratio.toFixed(1)}%
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Amortization schedule */}
      {schedule.length > 0 && (
        <div className="px-4 mb-4">
          <motion.div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
          >
            <button
              onClick={() => setScheduleOpen(!scheduleOpen)}
              className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
              style={{ borderBottom: scheduleOpen ? '1px solid #334155' : 'none' }}
            >
              <div className="flex items-center gap-2">
                <TrendingDown size={16} style={{ color: '#8B5CF6' }} />
                <span className="text-sm font-bold" style={{ color: '#E2E8F0' }}>
                  לוח סילוקין שנתי
                </span>
              </div>
              {scheduleOpen ? (
                <ChevronUp size={18} style={{ color: '#64748B' }} />
              ) : (
                <ChevronDown size={18} style={{ color: '#64748B' }} />
              )}
            </button>

            <AnimatePresence>
              {scheduleOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs" style={{ minWidth: 550 }}>
                      <thead>
                        <tr style={{ backgroundColor: '#0F172A' }}>
                          {['שנה', 'יתרת פתיחה', 'תשלום שנתי', 'קרן', 'ריבית', 'יתרת סגירה'].map(
                            (header) => (
                              <th
                                key={header}
                                className="px-2 py-2 text-center font-medium"
                                style={{ color: '#94A3B8' }}
                              >
                                {header}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.map((row, idx) => (
                          <tr
                            key={row.year}
                            style={{
                              backgroundColor: idx % 2 === 0 ? 'transparent' : '#0F172A',
                              borderTop: '1px solid #334155',
                            }}
                          >
                            <td className="px-2 py-2 text-center font-mono font-bold" style={{ color: '#E2E8F0' }}>
                              {row.year}
                            </td>
                            <td className="px-2 py-2 text-center font-mono" style={{ color: '#94A3B8' }}>
                              {formatCurrency(row.opening)}
                            </td>
                            <td className="px-2 py-2 text-center font-mono" style={{ color: '#E2E8F0' }}>
                              {formatCurrency(row.payment)}
                            </td>
                            <td className="px-2 py-2 text-center font-mono" style={{ color: '#10B981' }}>
                              {formatCurrency(row.principal)}
                            </td>
                            <td className="px-2 py-2 text-center font-mono" style={{ color: '#EF4444' }}>
                              {formatCurrency(row.interest)}
                            </td>
                            <td className="px-2 py-2 text-center font-mono" style={{ color: '#94A3B8' }}>
                              {formatCurrency(row.closing)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Line chart: Principal vs Interest over time */}
      {chartData.length > 0 && (
        <div className="px-4 mb-4">
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
          >
            <h3 className="text-sm font-bold mb-3" style={{ color: '#E2E8F0' }}>
              קרן מול ריבית לאורך זמן
            </h3>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                    label={{ value: 'שנה', position: 'insideBottomRight', fill: '#64748B', fontSize: 11, offset: -5 }}
                  />
                  <YAxis
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                    tickFormatter={(val) => `${Math.round(val / 1000)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: 12,
                      color: '#E2E8F0',
                      fontSize: 12,
                    }}
                    formatter={(value, name) => [
                      formatCurrency(Math.round(value)),
                      name === 'principal' ? 'קרן' : 'ריבית',
                    ]}
                    labelFormatter={(label) => `שנה ${label}`}
                  />
                  <Legend
                    formatter={(value) => (value === 'principal' ? 'קרן' : 'ריבית')}
                    wrapperStyle={{ color: '#94A3B8', fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="principal"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: '#10B981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="interest"
                    stroke="#EF4444"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: '#EF4444' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Multi-property comparison bar chart */}
      {multiPropData.length > 1 && (
        <div className="px-4 mb-4">
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
          >
            <h3 className="text-sm font-bold mb-1" style={{ color: '#E2E8F0' }}>
              השוואת החזר חודשי
            </h3>
            <p className="text-xs mb-3" style={{ color: '#64748B' }}>
              קו אדום מקווקו = תקרת בנק ישראל (33% מההכנסה)
            </p>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={multiPropData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#E2E8F0', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                    tickFormatter={(val) => `${Math.round(val / 1000)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: 12,
                      color: '#E2E8F0',
                      fontSize: 12,
                    }}
                    formatter={(value) => [formatCurrency(value), 'החזר חודשי']}
                  />
                  <ReferenceLine
                    y={incomeThreshold}
                    stroke="#EF4444"
                    strokeDasharray="6 4"
                    strokeWidth={2}
                    label={{
                      value: `תקרת בנק ישראל ${formatCurrency(incomeThreshold)}`,
                      position: 'top',
                      fill: '#EF4444',
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="monthly" radius={[6, 6, 0, 0]} barSize={36}>
                    {multiPropData.map((entry, idx) => (
                      <motion.rect key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Income reference */}
      <div className="px-4 mb-4">
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wallet size={16} style={{ color: '#10B981' }} />
              <h3 className="text-sm font-bold" style={{ color: '#E2E8F0' }}>
                הכנסה נטו חודשית
              </h3>
            </div>
            <button
              onClick={() => setEditingIncome(!editingIncome)}
              className="text-xs px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
              style={{
                backgroundColor: '#0F172A',
                color: '#3B82F6',
                border: '1px solid #334155',
              }}
            >
              {editingIncome ? 'סגור' : 'עריכה'}
            </button>
          </div>

          {editingIncome ? (
            <div className="mt-2">
              <SliderInput
                label="הכנסה נטו"
                value={netIncome}
                onChange={setNetIncome}
                min={5000}
                max={50000}
                step={500}
                unit="\u20AA"
                color="#10B981"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-lg font-mono font-bold" style={{ color: '#10B981' }}>
                {formatCurrency(netIncome)}
              </span>
              <span className="text-xs" style={{ color: '#64748B' }}>
                תקרת החזר (33%): {formatCurrency(incomeThreshold)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
