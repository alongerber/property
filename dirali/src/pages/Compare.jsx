import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Trophy, Star, ChevronDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import useStore from '../store/useStore';
import { calcTax, formatCurrency, formatNumber } from '../utils/calculations';
import { DECISION_CRITERIA, PROPERTY_COLORS } from '../utils/constants';
import SliderInput from '../components/shared/SliderInput';

const SIMPLE_CRITERIA = [
  { key: 'price', label: 'מחיר', format: (v) => formatCurrency(v), lowerBetter: true },
  { key: 'rooms', label: 'חדרים', format: (v) => formatNumber(v) },
  { key: 'built_area', label: 'שטח בנוי', format: (v) => `${formatNumber(v)} מ״ר` },
  { key: 'garden_area', label: 'גינה', format: (v) => v ? `${formatNumber(v)} מ״ר` : 'אין' },
  { key: 'parking', label: 'חניות', format: (v) => formatNumber(v || 0) },
  { key: 'mamad', label: 'ממ״ד', format: (v) => v ? 'יש' : 'אין' },
  { key: 'condition', label: 'מצב', format: (v) => v || '—' },
  { key: 'renovation_cost', label: 'שיפוצים נדרשים', format: (v) => v ? formatCurrency(v) : 'לא נדרש', lowerBetter: true },
  { key: 'tax', label: 'מס רכישה', format: (v) => formatCurrency(v), lowerBetter: true, computed: true },
  { key: 'totalCost', label: 'עלות כוללת', format: (v) => formatCurrency(v), lowerBetter: true, computed: true },
];

function getPropertyValue(property, criterion) {
  if (criterion.key === 'tax') return calcTax(property.price);
  if (criterion.key === 'totalCost') {
    return property.price + (property.renovation_cost || 0) + calcTax(property.price);
  }
  return property[criterion.key];
}

function findWinner(props, criterion) {
  if (props.length < 2) return null;
  const values = props.map((p) => {
    const val = getPropertyValue(p, criterion);
    return typeof val === 'number' ? val : (val ? 1 : 0);
  });

  if (values.every((v) => v === values[0])) return null;

  if (criterion.lowerBetter) {
    const minVal = Math.min(...values);
    const idx = values.indexOf(minVal);
    return props[idx]?.id;
  }

  const maxVal = Math.max(...values);
  const idx = values.indexOf(maxVal);
  return props[idx]?.id;
}

export default function Compare() {
  const [view, setView] = useState('simple');
  const properties = useStore((s) => s.properties);
  const decisionScores = useStore((s) => s.decisionScores);
  const setDecisionScore = useStore((s) => s.setDecisionScore);
  const decisionWeights = useStore((s) => s.decisionWeights);
  const setWeight = useStore((s) => s.setWeight);

  const activeProps = useMemo(
    () => properties.filter((p) => p.status !== 'dropped'),
    [properties]
  );

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#0B1120' }} dir="rtl">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-4">
          <Scale size={20} style={{ color: '#3B82F6' }} />
          <h1 className="text-lg font-bold" style={{ color: '#E2E8F0' }}>
            השוואת נכסים
          </h1>
        </div>

        {/* View toggle */}
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ backgroundColor: '#0F172A', border: '1px solid #334155' }}
        >
          <button
            onClick={() => setView('simple')}
            className="flex-1 py-2.5 text-sm font-medium transition-all cursor-pointer"
            style={{
              backgroundColor: view === 'simple' ? '#3B82F6' : 'transparent',
              color: view === 'simple' ? '#FFFFFF' : '#94A3B8',
            }}
          >
            השוואה פשוטה
          </button>
          <button
            onClick={() => setView('matrix')}
            className="flex-1 py-2.5 text-sm font-medium transition-all cursor-pointer"
            style={{
              backgroundColor: view === 'matrix' ? '#3B82F6' : 'transparent',
              color: view === 'matrix' ? '#FFFFFF' : '#94A3B8',
            }}
          >
            מטריצת החלטה משוקללת
          </button>
        </div>
      </div>

      {activeProps.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-sm" style={{ color: '#64748B' }}>
            אין נכסים פעילים להשוואה
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {view === 'simple' ? (
            <motion.div
              key="simple"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <SimpleComparison properties={activeProps} />
            </motion.div>
          ) : (
            <motion.div
              key="matrix"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WeightedMatrix
                properties={activeProps}
                decisionScores={decisionScores}
                setDecisionScore={setDecisionScore}
                decisionWeights={decisionWeights}
                setWeight={setWeight}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

/* ─── Simple Comparison ─── */
function SimpleComparison({ properties }) {
  const winCounts = useMemo(() => {
    const counts = {};
    properties.forEach((p) => { counts[p.id] = 0; });
    SIMPLE_CRITERIA.forEach((c) => {
      const winnerId = findWinner(properties, c);
      if (winnerId) counts[winnerId] = (counts[winnerId] || 0) + 1;
    });
    return counts;
  }, [properties]);

  return (
    <div className="px-4">
      <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #334155' }}>
        <table className="w-full text-sm" style={{ minWidth: properties.length * 140 + 120 }}>
          {/* Header */}
          <thead>
            <tr style={{ backgroundColor: '#1E293B' }}>
              <th
                className="sticky right-0 z-10 px-3 py-3 text-right font-medium"
                style={{ backgroundColor: '#1E293B', color: '#94A3B8', minWidth: 120 }}
              >
                קריטריון
              </th>
              {properties.map((p, i) => (
                <th
                  key={p.id}
                  className="px-3 py-3 text-center font-semibold"
                  style={{ color: '#E2E8F0', minWidth: 140 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PROPERTY_COLORS[i % PROPERTY_COLORS.length] }}
                    />
                    <span className="truncate">{p.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {SIMPLE_CRITERIA.map((criterion, rowIdx) => {
              const winnerId = findWinner(properties, criterion);
              return (
                <tr
                  key={criterion.key}
                  style={{
                    backgroundColor: rowIdx % 2 === 0 ? '#0F172A' : '#1E293B',
                    borderTop: '1px solid #334155',
                  }}
                >
                  <td
                    className="sticky right-0 z-10 px-3 py-2.5 font-medium"
                    style={{
                      backgroundColor: rowIdx % 2 === 0 ? '#0F172A' : '#1E293B',
                      color: '#94A3B8',
                    }}
                  >
                    {criterion.label}
                  </td>
                  {properties.map((p) => {
                    const val = getPropertyValue(p, criterion);
                    const isWinner = winnerId === p.id;
                    return (
                      <td
                        key={p.id}
                        className="px-3 py-2.5 text-center font-mono text-sm"
                        style={{
                          color: isWinner ? '#10B981' : '#E2E8F0',
                          fontWeight: isWinner ? 700 : 400,
                          backgroundColor: isWinner
                            ? 'rgba(16, 185, 129, 0.08)'
                            : 'transparent',
                        }}
                      >
                        {criterion.format(val)}
                        {isWinner && ' \u2714'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Total wins row */}
            <tr style={{ backgroundColor: '#1E293B', borderTop: '2px solid #334155' }}>
              <td
                className="sticky right-0 z-10 px-3 py-3 font-bold"
                style={{ backgroundColor: '#1E293B', color: '#E2E8F0' }}
              >
                <div className="flex items-center gap-1.5">
                  <Trophy size={14} style={{ color: '#F59E0B' }} />
                  סה״כ ניצחונות
                </div>
              </td>
              {properties.map((p) => {
                const maxWins = Math.max(...Object.values(winCounts));
                const isOverallWinner = winCounts[p.id] === maxWins && maxWins > 0;
                return (
                  <td
                    key={p.id}
                    className="px-3 py-3 text-center font-mono font-bold text-lg"
                    style={{
                      color: isOverallWinner ? '#F59E0B' : '#E2E8F0',
                    }}
                  >
                    {winCounts[p.id]}
                    {isOverallWinner && properties.length > 1 && (
                      <span className="mr-1 text-xs">&#127942;</span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Weighted Decision Matrix ─── */
function WeightedMatrix({ properties, decisionScores, setDecisionScore, decisionWeights, setWeight }) {
  const getScore = (propertyId, criterion) => {
    const entry = decisionScores.find(
      (s) => s.property_id === propertyId && s.criterion === criterion
    );
    return entry ? entry.score : 5;
  };

  const getWeight = (criterion) => {
    return decisionWeights[criterion] ?? 5;
  };

  const propertyScores = useMemo(() => {
    return properties.map((p, i) => {
      let weightedSum = 0;
      let totalWeight = 0;
      DECISION_CRITERIA.forEach((c) => {
        const score = getScore(p.id, c);
        const weight = getWeight(c);
        weightedSum += score * weight;
        totalWeight += weight;
      });
      const finalScore = totalWeight > 0
        ? (weightedSum / totalWeight) * 10
        : 0;
      return {
        id: p.id,
        name: p.name,
        score: Math.round(finalScore * 10) / 10,
        color: PROPERTY_COLORS[i % PROPERTY_COLORS.length],
      };
    });
  }, [properties, decisionScores, decisionWeights]);

  const winnerId = useMemo(() => {
    if (propertyScores.length < 2) return null;
    const maxScore = Math.max(...propertyScores.map((ps) => ps.score));
    const winner = propertyScores.find((ps) => ps.score === maxScore);
    return winner?.id;
  }, [propertyScores]);

  const chartData = useMemo(() => {
    return propertyScores.map((ps) => ({
      name: ps.name,
      score: ps.score,
      fill: ps.color,
    }));
  }, [propertyScores]);

  return (
    <div className="px-4 space-y-4">
      {/* Weights */}
      <div
        className="rounded-2xl p-4"
        style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
      >
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#E2E8F0' }}>
          <Star size={15} style={{ color: '#F59E0B' }} />
          משקלות קריטריונים
        </h3>
        <div className="space-y-2">
          {DECISION_CRITERIA.map((criterion) => (
            <SliderInput
              key={criterion}
              label={criterion}
              value={getWeight(criterion)}
              onChange={(val) => setWeight(criterion, val)}
              min={1}
              max={10}
              step={1}
              color="#F59E0B"
            />
          ))}
        </div>
      </div>

      {/* Scores per property per criterion */}
      <div
        className="rounded-2xl p-4"
        style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
      >
        <h3 className="text-sm font-bold mb-3" style={{ color: '#E2E8F0' }}>
          ציונים לפי נכס
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: properties.length * 100 + 140 }}>
            <thead>
              <tr>
                <th className="px-2 py-2 text-right font-medium" style={{ color: '#94A3B8', minWidth: 140 }}>
                  קריטריון (משקל)
                </th>
                {properties.map((p, i) => (
                  <th key={p.id} className="px-2 py-2 text-center" style={{ color: '#E2E8F0', minWidth: 100 }}>
                    <div className="flex items-center justify-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: PROPERTY_COLORS[i % PROPERTY_COLORS.length] }}
                      />
                      <span className="text-xs truncate">{p.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DECISION_CRITERIA.map((criterion, rowIdx) => (
                <tr
                  key={criterion}
                  style={{
                    backgroundColor: rowIdx % 2 === 0 ? '#0F172A' : 'transparent',
                    borderTop: '1px solid #1E293B',
                  }}
                >
                  <td className="px-2 py-2 text-sm" style={{ color: '#94A3B8' }}>
                    {criterion}
                    <span
                      className="mr-1 text-xs font-mono"
                      style={{ color: '#F59E0B' }}
                    >
                      ({getWeight(criterion)})
                    </span>
                  </td>
                  {properties.map((p) => {
                    const score = getScore(p.id, criterion);
                    return (
                      <td key={p.id} className="px-2 py-2 text-center">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={score}
                          onChange={(e) => {
                            const val = Math.max(1, Math.min(10, Number(e.target.value) || 1));
                            setDecisionScore(p.id, criterion, val);
                          }}
                          className="w-14 mx-auto text-center text-sm font-mono rounded-lg px-2 py-1.5 outline-none transition-colors"
                          style={{
                            backgroundColor: '#0F172A',
                            color: '#E2E8F0',
                            border: '1px solid #334155',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#3B82F6';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#334155';
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Final scores */}
      <div className="space-y-2">
        {propertyScores.map((ps) => (
          <motion.div
            key={ps.id}
            layout
            className="rounded-xl p-4 flex items-center justify-between"
            style={{
              backgroundColor: '#1E293B',
              border: winnerId === ps.id ? '2px solid #F59E0B' : '1px solid #334155',
              boxShadow: winnerId === ps.id ? '0 0 20px rgba(245, 158, 11, 0.15)' : 'none',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: ps.color }}
              />
              <span className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>
                {ps.name}
              </span>
              {winnerId === ps.id && properties.length > 1 && (
                <Trophy size={16} style={{ color: '#F59E0B' }} />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-2xl font-mono font-bold"
                style={{ color: winnerId === ps.id ? '#F59E0B' : '#E2E8F0' }}
              >
                {ps.score.toFixed(1)}
              </span>
              <span className="text-xs" style={{ color: '#64748B' }}>/ 100</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bar chart */}
      {propertyScores.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
        >
          <h3 className="text-sm font-bold mb-3" style={{ color: '#E2E8F0' }}>
            גרף ציונים
          </h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#E2E8F0', fontSize: 12 }}
                  axisLine={{ stroke: '#334155' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: 12,
                    color: '#E2E8F0',
                    fontSize: 13,
                  }}
                  formatter={(value) => [`${value.toFixed(1)}`, 'ציון']}
                />
                <Bar
                  dataKey="score"
                  radius={[0, 6, 6, 0]}
                  barSize={28}
                  isAnimationActive={true}
                >
                  {chartData.map((entry, idx) => (
                    <motion.rect key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
