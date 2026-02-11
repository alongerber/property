import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Trash2, Edit3, X, Check, Copy, StickyNote } from 'lucide-react';
import useStore from '../store/useStore';
import {
  calcTax, calcMortgage, formatCurrency, getIncomeRatio, getIncomeRatioColor,
} from '../utils/calculations';
import { PROPERTY_COLORS } from '../utils/constants';
import SliderInput from '../components/shared/SliderInput';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const MAX_COMPARE = 3;

export default function Scenarios() {
  const properties = useStore((s) => s.properties);
  const equitySources = useStore((s) => s.equitySources);
  const totalEquity = useStore((s) => s.totalEquity);
  const scenarios = useStore((s) => s.scenarios);
  const addScenario = useStore((s) => s.addScenario);
  const updateScenario = useStore((s) => s.updateScenario);
  const deleteScenario = useStore((s) => s.deleteScenario);
  const mortgageYears = useStore((s) => s.mortgageYears);
  const mortgageRate = useStore((s) => s.mortgageRate);
  const netIncome = useStore((s) => s.netIncome);
  const isFirstProperty = useStore((s) => s.isFirstProperty);

  const activeProps = useMemo(
    () => properties.filter((p) => p.status !== 'dropped'),
    [properties]
  );

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ─── Create / Edit form state ───
  const emptyForm = () => ({
    name: '',
    equityOverrides: {},
    mortgageRateOverride: mortgageRate,
    mortgageYearsOverride: mortgageYears,
    priceOverrides: {},
    notes: '',
  });

  const [form, setForm] = useState(emptyForm());

  const handleCreate = () => {
    if (!form.name.trim()) return;
    addScenario({
      name: form.name.trim(),
      equityOverrides: form.equityOverrides,
      mortgageRate: form.mortgageRateOverride,
      mortgageYears: form.mortgageYearsOverride,
      priceOverrides: form.priceOverrides,
      notes: form.notes.trim(),
    });
    setForm(emptyForm());
    setShowCreate(false);
  };

  const handleUpdate = () => {
    if (!editingId || !form.name.trim()) return;
    updateScenario(editingId, {
      name: form.name.trim(),
      equityOverrides: form.equityOverrides,
      mortgageRate: form.mortgageRateOverride,
      mortgageYears: form.mortgageYearsOverride,
      priceOverrides: form.priceOverrides,
      notes: form.notes.trim(),
    });
    setEditingId(null);
    setForm(emptyForm());
  };

  const startEdit = (scenario) => {
    setForm({
      name: scenario.name,
      equityOverrides: scenario.equityOverrides || {},
      mortgageRateOverride: scenario.mortgageRate ?? mortgageRate,
      mortgageYearsOverride: scenario.mortgageYears ?? mortgageYears,
      priceOverrides: scenario.priceOverrides || {},
      notes: scenario.notes || '',
    });
    setEditingId(scenario.id);
    setShowCreate(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  // Compute scenario results for a given scenario
  function computeScenarioResults(scenario) {
    const sRate = scenario.mortgageRate ?? mortgageRate;
    const sYears = scenario.mortgageYears ?? mortgageYears;

    // Calculate equity with overrides
    let scenarioEquity = 0;
    equitySources.forEach((src) => {
      const override = scenario.equityOverrides?.[src.id];
      scenarioEquity += override !== undefined ? override : src.current_estimate;
    });

    return activeProps.map((p, i) => {
      const priceOverride = scenario.priceOverrides?.[p.id];
      const price = priceOverride !== undefined ? priceOverride : p.price;
      const tax = calcTax(price, isFirstProperty);
      const renovation = p.renovation_estimate || 0;
      const totalCost = price + tax + renovation;
      const mortgageAmount = Math.max(0, totalCost - scenarioEquity);
      const monthly = mortgageAmount > 0
        ? Math.round(calcMortgage(mortgageAmount, sRate, sYears))
        : 0;
      const ratio = netIncome > 0 ? getIncomeRatio(monthly, netIncome) : 0;

      return {
        propertyId: p.id,
        propertyName: p.name,
        color: PROPERTY_COLORS[i % PROPERTY_COLORS.length],
        price,
        mortgageAmount,
        monthly,
        ratio,
        scenarioEquity,
      };
    });
  }

  // Toggle compare selection
  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const comparingScenarios = scenarios.filter((s) => compareIds.includes(s.id));

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#0B1120' }} dir="rtl">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers size={20} style={{ color: '#8B5CF6' }} />
            <h1 className="text-lg font-bold" style={{ color: '#E2E8F0' }}>
              תרחישים
            </h1>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-mono"
              style={{ backgroundColor: '#1E293B', color: '#94A3B8' }}
            >
              {scenarios.length}
            </span>
          </div>
          <button
            onClick={() => {
              setShowCreate(true);
              setEditingId(null);
              setForm(emptyForm());
            }}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl cursor-pointer transition-colors"
            style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF' }}
          >
            <Plus size={16} />
            תרחיש חדש
          </button>
        </div>
      </div>

      {/* Create / Edit form */}
      <AnimatePresence>
        {(showCreate || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 mb-4">
              <div
                className="rounded-2xl p-4 space-y-4"
                style={{
                  backgroundColor: '#1E293B',
                  border: `1px solid ${editingId ? '#F59E0B' : '#8B5CF6'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold" style={{ color: '#E2E8F0' }}>
                    {editingId ? 'עריכת תרחיש' : 'תרחיש חדש'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreate(false);
                      cancelEdit();
                    }}
                    className="p-1 cursor-pointer"
                  >
                    <X size={18} style={{ color: '#64748B' }} />
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#94A3B8' }}>
                    שם התרחיש
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="לדוגמא: תרחיש אופטימי"
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: '#0F172A',
                      color: '#E2E8F0',
                      border: '1px solid #334155',
                    }}
                  />
                </div>

                {/* Mortgage overrides */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold" style={{ color: '#94A3B8' }}>
                    הגדרות משכנתא
                  </h4>
                  <SliderInput
                    label="ריבית"
                    value={form.mortgageRateOverride}
                    onChange={(val) => setForm({ ...form, mortgageRateOverride: val })}
                    min={3.0}
                    max={6.5}
                    step={0.1}
                    unit="%"
                    color="#F59E0B"
                  />
                  <SliderInput
                    label="שנים"
                    value={form.mortgageYearsOverride}
                    onChange={(val) => setForm({ ...form, mortgageYearsOverride: val })}
                    min={15}
                    max={30}
                    step={1}
                    unit="שנים"
                    color="#3B82F6"
                  />
                </div>

                {/* Equity overrides */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold" style={{ color: '#94A3B8' }}>
                    דריסות הון עצמי
                  </h4>
                  {equitySources.map((src) => {
                    const overrideVal = form.equityOverrides[src.id];
                    const currentVal = overrideVal !== undefined ? overrideVal : src.current_estimate;
                    return (
                      <SliderInput
                        key={src.id}
                        label={src.label}
                        value={currentVal}
                        onChange={(val) =>
                          setForm({
                            ...form,
                            equityOverrides: { ...form.equityOverrides, [src.id]: val },
                          })
                        }
                        min={src.min_amount}
                        max={src.max_amount}
                        step={10000}
                        unit="\u20AA"
                        color="#10B981"
                      />
                    );
                  })}
                </div>

                {/* Price overrides */}
                {activeProps.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold" style={{ color: '#94A3B8' }}>
                      דריסות מחיר נכס
                    </h4>
                    {activeProps.map((p) => {
                      const overrideVal = form.priceOverrides[p.id];
                      const currentVal = overrideVal !== undefined ? overrideVal : p.price;
                      return (
                        <div key={p.id}>
                          <label className="text-xs mb-0.5 block" style={{ color: '#64748B' }}>
                            {p.name}
                          </label>
                          <input
                            type="number"
                            value={currentVal}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                priceOverrides: {
                                  ...form.priceOverrides,
                                  [p.id]: Number(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-full rounded-xl px-3 py-2 text-sm font-mono outline-none"
                            style={{
                              backgroundColor: '#0F172A',
                              color: '#E2E8F0',
                              border: '1px solid #334155',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#94A3B8' }}>
                    הערות
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="הערות נוספות..."
                    rows={2}
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                    style={{
                      backgroundColor: '#0F172A',
                      color: '#E2E8F0',
                      border: '1px solid #334155',
                    }}
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={editingId ? handleUpdate : handleCreate}
                  disabled={!form.name.trim()}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: editingId ? '#F59E0B' : '#8B5CF6',
                    color: '#FFFFFF',
                  }}
                >
                  <Check size={16} />
                  {editingId ? 'עדכן תרחיש' : 'צור תרחיש'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scenario cards */}
      {scenarios.length === 0 && !showCreate ? (
        <div className="px-4 py-16 text-center">
          <Layers size={48} className="mx-auto mb-3" style={{ color: '#334155' }} />
          <p className="text-sm" style={{ color: '#64748B' }}>
            אין תרחישים עדיין. צור תרחיש חדש לבדוק מצבים שונים.
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {scenarios.map((scenario) => {
            const results = computeScenarioResults(scenario);
            const isComparing = compareIds.includes(scenario.id);
            const overrideCount =
              Object.keys(scenario.equityOverrides || {}).length +
              Object.keys(scenario.priceOverrides || {}).length +
              ((scenario.mortgageRate ?? mortgageRate) !== mortgageRate ? 1 : 0) +
              ((scenario.mortgageYears ?? mortgageYears) !== mortgageYears ? 1 : 0);

            return (
              <motion.div
                key={scenario.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: '#1E293B',
                  border: isComparing ? '2px solid #8B5CF6' : '1px solid #334155',
                }}
              >
                {/* Card header */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '1px solid #334155' }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-bold truncate" style={{ color: '#E2E8F0' }}>
                      {scenario.name}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#0F172A', color: '#8B5CF6' }}
                    >
                      {overrideCount} דריסות
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggleCompare(scenario.id)}
                      className="p-1.5 rounded-lg cursor-pointer transition-colors"
                      title="השווה"
                      style={{
                        backgroundColor: isComparing ? '#8B5CF6' : '#0F172A',
                        color: isComparing ? '#FFFFFF' : '#94A3B8',
                      }}
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => startEdit(scenario)}
                      className="p-1.5 rounded-lg cursor-pointer transition-colors"
                      style={{ backgroundColor: '#0F172A', color: '#94A3B8' }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(scenario.id)}
                      className="p-1.5 rounded-lg cursor-pointer transition-colors"
                      style={{ backgroundColor: '#0F172A', color: '#EF4444' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Overrides summary */}
                <div className="px-4 py-2 flex flex-wrap gap-2" style={{ backgroundColor: '#0F172A' }}>
                  {(scenario.mortgageRate ?? mortgageRate) !== mortgageRate && (
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#1E293B', color: '#F59E0B' }}>
                      ריבית: {scenario.mortgageRate}%
                    </span>
                  )}
                  {(scenario.mortgageYears ?? mortgageYears) !== mortgageYears && (
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#1E293B', color: '#3B82F6' }}>
                      שנים: {scenario.mortgageYears}
                    </span>
                  )}
                  {Object.entries(scenario.equityOverrides || {}).map(([srcId, val]) => {
                    const src = equitySources.find((s) => s.id === srcId);
                    return (
                      <span key={srcId} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#1E293B', color: '#10B981' }}>
                        {src?.label}: {formatCurrency(val)}
                      </span>
                    );
                  })}
                  {Object.entries(scenario.priceOverrides || {}).map(([propId, val]) => {
                    const prop = activeProps.find((p) => p.id === propId);
                    return (
                      <span key={propId} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#1E293B', color: '#E2E8F0' }}>
                        {prop?.name}: {formatCurrency(val)}
                      </span>
                    );
                  })}
                </div>

                {/* Results per property */}
                <div className="divide-y" style={{ borderColor: '#33415555' }}>
                  {results.map((r) => {
                    const ratioColor = getIncomeRatioColor(r.ratio);
                    return (
                      <div key={r.propertyId} className="flex items-center justify-between px-4 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: r.color }}
                          />
                          <span className="text-sm truncate" style={{ color: '#E2E8F0' }}>
                            {r.propertyName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-sm font-mono" style={{ color: '#E2E8F0' }}>
                            {formatCurrency(r.monthly)}
                          </span>
                          <span
                            className="text-xs font-mono px-2 py-0.5 rounded-full"
                            style={{
                              color: ratioColor,
                              backgroundColor: `${ratioColor}15`,
                            }}
                          >
                            {r.ratio.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Notes */}
                {scenario.notes && (
                  <div className="px-4 py-2" style={{ backgroundColor: '#0F172A' }}>
                    <div className="flex items-start gap-1.5">
                      <StickyNote size={12} className="mt-0.5 flex-shrink-0" style={{ color: '#64748B' }} />
                      <p className="text-xs" style={{ color: '#64748B' }}>
                        {scenario.notes}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Side-by-side comparison */}
      {comparingScenarios.length >= 2 && (
        <div className="px-4 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Copy size={16} style={{ color: '#8B5CF6' }} />
            <h2 className="text-sm font-bold" style={{ color: '#E2E8F0' }}>
              השוואת תרחישים ({comparingScenarios.length})
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #334155' }}>
            <table className="w-full text-sm" style={{ minWidth: comparingScenarios.length * 150 + 120 }}>
              <thead>
                <tr style={{ backgroundColor: '#1E293B' }}>
                  <th
                    className="sticky right-0 z-10 px-3 py-3 text-right font-medium"
                    style={{ backgroundColor: '#1E293B', color: '#94A3B8', minWidth: 120 }}
                  >
                    נכס
                  </th>
                  {comparingScenarios.map((s) => (
                    <th
                      key={s.id}
                      className="px-3 py-3 text-center font-bold"
                      style={{ color: '#E2E8F0', minWidth: 150 }}
                    >
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeProps.map((prop, propIdx) => {
                  const results = comparingScenarios.map((s) => {
                    const res = computeScenarioResults(s);
                    return res.find((r) => r.propertyId === prop.id);
                  });

                  return (
                    <tr
                      key={prop.id}
                      style={{
                        backgroundColor: propIdx % 2 === 0 ? '#0F172A' : '#1E293B',
                        borderTop: '1px solid #334155',
                      }}
                    >
                      <td
                        className="sticky right-0 z-10 px-3 py-2.5 font-medium"
                        style={{
                          backgroundColor: propIdx % 2 === 0 ? '#0F172A' : '#1E293B',
                          color: '#E2E8F0',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: PROPERTY_COLORS[propIdx % PROPERTY_COLORS.length] }}
                          />
                          {prop.name}
                        </div>
                      </td>
                      {results.map((r, idx) => {
                        if (!r) return <td key={idx} className="px-3 py-2.5 text-center" style={{ color: '#64748B' }}>—</td>;
                        const ratioColor = getIncomeRatioColor(r.ratio);
                        return (
                          <td key={idx} className="px-3 py-2.5 text-center">
                            <div className="font-mono text-sm font-semibold" style={{ color: '#E2E8F0' }}>
                              {formatCurrency(r.monthly)}
                            </div>
                            <span
                              className="text-xs font-mono"
                              style={{ color: ratioColor }}
                            >
                              {r.ratio.toFixed(1)}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Equity row */}
                <tr style={{ backgroundColor: '#1E293B', borderTop: '2px solid #334155' }}>
                  <td
                    className="sticky right-0 z-10 px-3 py-2.5 font-bold text-xs"
                    style={{ backgroundColor: '#1E293B', color: '#10B981' }}
                  >
                    הון עצמי
                  </td>
                  {comparingScenarios.map((s) => {
                    const results = computeScenarioResults(s);
                    const eq = results[0]?.scenarioEquity ?? 0;
                    return (
                      <td key={s.id} className="px-3 py-2.5 text-center font-mono text-sm" style={{ color: '#10B981' }}>
                        {formatCurrency(eq)}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteScenario(deleteConfirm);
            setCompareIds((prev) => prev.filter((id) => id !== deleteConfirm));
          }
          setDeleteConfirm(null);
        }}
        title="מחיקת תרחיש"
        message="האם למחוק את התרחיש? פעולה זו לא ניתנת לביטול."
        confirmText="מחק"
        cancelText="ביטול"
        variant="danger"
      />
    </div>
  );
}
