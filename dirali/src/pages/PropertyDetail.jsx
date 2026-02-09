import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit3,
  Trash2,
  Phone,
  ExternalLink,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  BedDouble,
  Maximize,
  Building2,
  Trees,
  Shield,
  ArrowUpDown,
  Package,
  Accessibility,
  User,
  Send,
  MapPin,
  FileText,
  CheckCircle2,
  StickyNote,
  MessageSquare,
  Mail,
  HandCoins,
} from 'lucide-react';
import useStore from '../store/useStore';
import { PIPELINE_STATUSES, ACTIVITY_TYPES } from '../utils/constants';
import {
  calcTax,
  calcMortgage,
  formatCurrency,
  formatNumber,
  relativeTime,
  getIncomeRatio,
  getIncomeRatioColor,
} from '../utils/calculations';
import StatusPill from '../components/property/StatusPill';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const ICON_MAP = { Phone, MapPin, FileText, CheckCircle2, StickyNote, MessageSquare, Mail, HandCoins };

// ---------------------------------------------------------------------------
// Editable List component for Highlights / Risks
// ---------------------------------------------------------------------------
function EditableList({ items, onUpdate, accentColor, placeholder }) {
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [addValue, setAddValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingIdx !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingIdx]);

  const startEdit = (idx) => {
    setEditingIdx(idx);
    setEditValue(items[idx]);
  };

  const commitEdit = () => {
    if (editingIdx === null) return;
    const trimmed = editValue.trim();
    if (trimmed) {
      const next = [...items];
      next[editingIdx] = trimmed;
      onUpdate(next);
    }
    setEditingIdx(null);
    setEditValue('');
  };

  const removeItem = (idx) => {
    onUpdate(items.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    const trimmed = addValue.trim();
    if (trimmed) {
      onUpdate([...items, trimmed]);
      setAddValue('');
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 group"
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          {editingIdx === idx ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitEdit();
                if (e.key === 'Escape') {
                  setEditingIdx(null);
                  setEditValue('');
                }
              }}
              className="flex-1 text-sm px-2 py-1 rounded"
              style={{
                backgroundColor: '#0F172A',
                border: `1px solid ${accentColor}`,
                color: '#E2E8F0',
                outline: 'none',
              }}
            />
          ) : (
            <span
              className="flex-1 text-sm cursor-pointer"
              style={{ color: '#E2E8F0' }}
              onClick={() => startEdit(idx)}
            >
              {item}
            </span>
          )}
          <button
            onClick={() => removeItem(idx)}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5"
            style={{ color: '#64748B' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {/* Add new item */}
      <div className="flex items-center gap-2 mt-1">
        <input
          value={addValue}
          onChange={(e) => setAddValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addItem();
          }}
          placeholder={placeholder}
          className="flex-1 text-sm px-2 py-1 rounded"
          style={{
            backgroundColor: '#0F172A',
            border: '1px solid #334155',
            color: '#E2E8F0',
            outline: 'none',
          }}
        />
        <button
          onClick={addItem}
          className="p-1 rounded cursor-pointer transition-colors"
          style={{ color: accentColor }}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main PropertyDetail component
// ---------------------------------------------------------------------------
export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const property = useStore((s) => s.properties.find((p) => p.id === id));
  const updateProperty = useStore((s) => s.updateProperty);
  const updatePropertyStatus = useStore((s) => s.updatePropertyStatus);
  const deleteProperty = useStore((s) => s.deleteProperty);
  const activities = useStore((s) => s.activities);
  const addActivity = useStore((s) => s.addActivity);
  const totalEquity = useStore((s) => s.totalEquity);
  const mortgageYears = useStore((s) => s.mortgageYears);
  const mortgageRate = useStore((s) => s.mortgageRate);
  const netIncome = useStore((s) => s.netIncome);

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState(null);

  // Activity quick-add state
  const [activityType, setActivityType] = useState('note');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityContent, setActivityContent] = useState('');

  const statusDropdownRef = useRef(null);

  // Close status dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target)
      ) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // --- derived calculations ---
  const financial = useMemo(() => {
    if (!property) return null;
    const price = property.price || 0;
    const tax = calcTax(price);
    const renovation = property.renovation_estimate || 0;
    const totalCost = price + tax + renovation;
    const equity = totalEquity();
    const mortgageNeeded = Math.max(0, totalCost - equity);
    const monthlyPayment =
      mortgageNeeded > 0
        ? Math.round(calcMortgage(mortgageNeeded, mortgageRate, mortgageYears))
        : 0;
    const ratio = monthlyPayment > 0 ? getIncomeRatio(monthlyPayment, netIncome) : 0;
    const ratioColor = getIncomeRatioColor(ratio);
    return {
      price,
      tax,
      renovation,
      totalCost,
      equity,
      mortgageNeeded,
      monthlyPayment,
      ratio,
      ratioColor,
    };
  }, [property, totalEquity, mortgageRate, mortgageYears, netIncome]);

  const propertyActivities = useMemo(
    () =>
      activities
        .filter((a) => a.property_id === id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [activities, id]
  );

  // --- handlers ---
  const handleStatusChange = (newStatus) => {
    updatePropertyStatus(id, newStatus);
    setShowStatusDropdown(false);
  };

  const handleDelete = () => {
    deleteProperty(id);
    navigate('/properties');
  };

  const handleAddActivity = () => {
    const trimmedTitle = activityTitle.trim();
    if (!trimmedTitle) return;
    addActivity({
      property_id: id,
      type: activityType,
      title: trimmedTitle,
      content: activityContent.trim(),
    });
    setActivityTitle('');
    setActivityContent('');
    setActivityType('note');
  };

  const handleHighlightsUpdate = (next) => {
    updateProperty(id, { highlights: next });
  };

  const handleRisksUpdate = (next) => {
    updateProperty(id, { risks: next });
  };

  // --- guard ---
  if (!property) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20"
        dir="rtl"
      >
        <h2
          className="text-xl font-bold mb-2"
          style={{ color: '#E2E8F0' }}
        >
          נכס לא נמצא
        </h2>
        <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
          הנכס שחיפשת אינו קיים או נמחק
        </p>
        <button
          onClick={() => navigate('/properties')}
          className="px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
          style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
        >
          חזרה לנכסים
        </button>
      </div>
    );
  }

  const color = property.color || '#3B82F6';

  // ===========================================================================
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24" dir="rtl">
      {/* ===== HEADER with gradient ===== */}
      <div
        className="relative px-4 pt-6 pb-8"
        style={{
          background: `linear-gradient(135deg, ${color}33 0%, ${color}0D 100%)`,
          borderBottom: `1px solid ${color}44`,
        }}
      >
        {/* Top row: back / edit */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/properties')}
            className="text-sm cursor-pointer"
            style={{ color: '#94A3B8' }}
          >
            &larr; חזרה
          </button>
          <button
            onClick={() => navigate(`/properties/${id}/edit`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm cursor-pointer"
            style={{
              backgroundColor: '#1E293B',
              color: '#E2E8F0',
              border: '1px solid #334155',
            }}
          >
            <Edit3 size={14} />
            עריכה
          </button>
        </div>

        {/* Name */}
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: '#FFFFFF' }}
        >
          {property.name}
        </h1>

        {/* Street */}
        {property.street && (
          <p className="text-sm mb-3" style={{ color: '#94A3B8' }}>
            {property.street}
            {property.city ? `, ${property.city}` : ''}
          </p>
        )}

        {/* Price */}
        <p
          className="font-mono font-bold mb-4"
          style={{ color: '#FFFFFF', fontSize: 28 }}
        >
          {property.price ? formatCurrency(property.price) : '---'}
        </p>

        {/* Status pill with dropdown */}
        <div className="relative inline-block" ref={statusDropdownRef}>
          <StatusPill
            status={property.status}
            size="md"
            onClick={() => setShowStatusDropdown((prev) => !prev)}
          />
          <AnimatePresence>
            {showStatusDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 right-0 z-30 rounded-xl p-2 min-w-[160px]"
                style={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                }}
              >
                {PIPELINE_STATUSES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStatusChange(s.id)}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-right cursor-pointer transition-colors"
                    style={{
                      color:
                        s.id === property.status ? s.color : '#E2E8F0',
                      backgroundColor:
                        s.id === property.status
                          ? `${s.color}1A`
                          : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (s.id !== property.status)
                        e.currentTarget.style.backgroundColor = '#334155';
                    }}
                    onMouseLeave={(e) => {
                      if (s.id !== property.status)
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.label}
                    {s.id === property.status && (
                      <Check size={14} className="mr-auto" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* ===== SPECS GRID ===== */}
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: 'חדרים',
              value: property.rooms,
              icon: BedDouble,
            },
            {
              label: 'מ״ר בנוי',
              value: property.sqm_built,
              icon: Maximize,
            },
            {
              label: 'קומה',
              value: property.floor,
              icon: Building2,
            },
            {
              label: 'גינה מ״ר',
              value: property.sqm_garden || '---',
              icon: Trees,
            },
          ].map((spec) => (
            <div
              key={spec.label}
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: '#0F172A' }}
            >
              <spec.icon
                size={18}
                className="mx-auto mb-1.5"
                style={{ color: '#64748B' }}
              />
              <p
                className="text-lg font-bold"
                style={{ color: '#E2E8F0' }}
              >
                {spec.value || '---'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                {spec.label}
              </p>
            </div>
          ))}
        </div>

        {/* ===== BOOLEAN FEATURES ===== */}
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'has_mamad', label: 'ממ"ד', icon: Shield },
            { key: 'has_elevator', label: 'מעלית', icon: ArrowUpDown },
            { key: 'has_storage', label: 'מחסן', icon: Package },
            { key: 'has_accessible', label: 'נגישות', icon: Accessibility },
          ].map((feat) => {
            const active = property[feat.key];
            return (
              <div
                key={feat.key}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: active ? `${color}1A` : '#0F172A',
                  border: `1px solid ${active ? `${color}44` : '#334155'}`,
                }}
              >
                <feat.icon
                  size={16}
                  style={{ color: active ? color : '#64748B' }}
                />
                <span
                  className="text-sm"
                  style={{ color: active ? '#E2E8F0' : '#64748B' }}
                >
                  {feat.label}
                </span>
                {active && (
                  <Check size={14} style={{ color: '#10B981' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ===== FEATURES TAGS ===== */}
        {property.features && property.features.length > 0 && (
          <div>
            <h3
              className="text-sm font-semibold mb-2"
              style={{ color: '#94A3B8' }}
            >
              תכונות
            </h3>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feat, i) => (
                <span
                  key={i}
                  className="text-sm px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${color}26`,
                    color: color,
                  }}
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ===== HIGHLIGHTS & RISKS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Highlights */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: '#1E293B' }}
          >
            <h3
              className="text-sm font-semibold mb-3 flex items-center gap-2"
              style={{ color: '#10B981' }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: '#10B981' }}
              />
              יתרונות
            </h3>
            <EditableList
              items={property.highlights || []}
              onUpdate={handleHighlightsUpdate}
              accentColor="#10B981"
              placeholder="הוסף יתרון..."
            />
          </div>

          {/* Risks */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: '#1E293B' }}
          >
            <h3
              className="text-sm font-semibold mb-3 flex items-center gap-2"
              style={{ color: '#EF4444' }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: '#EF4444' }}
              />
              סיכונים
            </h3>
            <EditableList
              items={property.risks || []}
              onUpdate={handleRisksUpdate}
              accentColor="#EF4444"
              placeholder="הוסף סיכון..."
            />
          </div>
        </div>

        {/* ===== FINANCIAL SUMMARY ===== */}
        {financial && financial.price > 0 && (
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: '#0F172A', border: '1px solid #334155' }}
          >
            <h3
              className="text-sm font-semibold mb-4"
              style={{ color: '#94A3B8' }}
            >
              סיכום פיננסי
            </h3>

            <div className="space-y-3">
              {/* Price */}
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#94A3B8' }}>
                  מחיר
                </span>
                <span
                  className="text-sm font-mono font-semibold"
                  style={{ color: '#E2E8F0' }}
                >
                  {formatCurrency(financial.price)}
                </span>
              </div>

              {/* Tax */}
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#94A3B8' }}>
                  מס רכישה
                </span>
                <span
                  className="text-sm font-mono"
                  style={{ color: '#F59E0B' }}
                >
                  {formatCurrency(financial.tax)}
                </span>
              </div>

              {/* Renovation */}
              {financial.renovation > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#94A3B8' }}>
                    שיפוץ משוער
                  </span>
                  <span
                    className="text-sm font-mono"
                    style={{ color: '#F97316' }}
                  >
                    {formatCurrency(financial.renovation)}
                  </span>
                </div>
              )}

              {/* Divider */}
              <div
                className="h-px my-2"
                style={{ backgroundColor: '#334155' }}
              />

              {/* Total cost */}
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-semibold"
                  style={{ color: '#E2E8F0' }}
                >
                  עלות כוללת
                </span>
                <span
                  className="text-base font-mono font-bold"
                  style={{ color: '#E2E8F0' }}
                >
                  {formatCurrency(financial.totalCost)}
                </span>
              </div>

              {/* Equity */}
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#94A3B8' }}>
                  הון עצמי
                </span>
                <span
                  className="text-sm font-mono"
                  style={{ color: '#10B981' }}
                >
                  {formatCurrency(financial.equity)}
                </span>
              </div>

              {/* Mortgage needed */}
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#94A3B8' }}>
                  משכנתא נדרשת
                </span>
                <span
                  className="text-sm font-mono font-semibold"
                  style={{ color: '#3B82F6' }}
                >
                  {formatCurrency(financial.mortgageNeeded)}
                </span>
              </div>

              {/* Divider */}
              <div
                className="h-px my-2"
                style={{ backgroundColor: '#334155' }}
              />

              {/* Monthly payment */}
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-semibold"
                  style={{ color: '#E2E8F0' }}
                >
                  החזר חודשי
                </span>
                <span
                  className="text-lg font-mono font-bold"
                  style={{ color: '#E2E8F0' }}
                >
                  {formatCurrency(financial.monthlyPayment)}
                </span>
              </div>

              {/* Income ratio */}
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#94A3B8' }}>
                  אחוז מההכנסה
                </span>
                <span
                  className="text-sm font-mono font-bold px-2 py-0.5 rounded"
                  style={{
                    color: financial.ratioColor,
                    backgroundColor: `${financial.ratioColor}1A`,
                  }}
                >
                  {financial.ratio.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ===== BROKER INFO ===== */}
        {(property.broker_name ||
          property.broker_phone ||
          property.broker_license) && (
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: '#1E293B' }}
          >
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: '#94A3B8' }}
            >
              פרטי מתווך
            </h3>
            <div className="space-y-2">
              {property.broker_name && (
                <div className="flex items-center gap-2">
                  <User size={15} style={{ color: '#64748B' }} />
                  <span className="text-sm" style={{ color: '#E2E8F0' }}>
                    {property.broker_name}
                  </span>
                </div>
              )}
              {property.broker_phone && (
                <div className="flex items-center gap-2">
                  <Phone size={15} style={{ color: '#64748B' }} />
                  <a
                    href={`tel:${property.broker_phone}`}
                    className="text-sm underline"
                    style={{ color: '#3B82F6' }}
                  >
                    {property.broker_phone}
                  </a>
                </div>
              )}
              {property.broker_license && (
                <div className="flex items-center gap-2">
                  <Shield size={15} style={{ color: '#64748B' }} />
                  <span className="text-sm" style={{ color: '#94A3B8' }}>
                    רישיון: {property.broker_license}
                  </span>
                </div>
              )}
              {property.listing_url && (
                <div className="flex items-center gap-2">
                  <ExternalLink size={15} style={{ color: '#64748B' }} />
                  <a
                    href={property.listing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline"
                    style={{ color: '#3B82F6' }}
                  >
                    קישור למודעה
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ACTIVITY TIMELINE ===== */}
        <div>
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: '#94A3B8' }}
          >
            יומן פעילות
          </h3>

          {/* Quick-add form */}
          <div
            className="rounded-xl p-4 mb-4"
            style={{ backgroundColor: '#1E293B' }}
          >
            {/* Activity type selector buttons */}
            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              {ACTIVITY_TYPES.map((t) => {
                const IconComp = ICON_MAP[t.icon] || StickyNote;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActivityType(t.id)}
                    className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                    style={{
                      backgroundColor:
                        activityType === t.id
                          ? 'rgba(59, 130, 246, 0.2)'
                          : 'transparent',
                      border:
                        activityType === t.id
                          ? '1px solid rgba(59, 130, 246, 0.4)'
                          : '1px solid transparent',
                    }}
                  >
                    <IconComp size={18} style={{ color: activityType === t.id ? '#3B82F6' : '#94A3B8' }} />
                    <span
                      className="text-[10px]"
                      style={{
                        color: activityType === t.id ? '#3B82F6' : '#94A3B8',
                      }}
                    >
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <input
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddActivity();
                }}
                placeholder="כותרת..."
                className="flex-1 text-sm rounded-lg px-3 py-1.5"
                style={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  color: '#E2E8F0',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAddActivity}
                disabled={!activityTitle.trim()}
                className="p-2 rounded-lg cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-default"
                style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
              >
                <Send size={16} />
              </button>
            </div>
            <textarea
              value={activityContent}
              onChange={(e) => setActivityContent(e.target.value)}
              placeholder="תוכן (אופציונלי)..."
              rows={2}
              className="w-full text-sm rounded-lg px-3 py-2 resize-none"
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                color: '#E2E8F0',
                outline: 'none',
              }}
            />
          </div>

          {/* Timeline list */}
          {propertyActivities.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: '#64748B' }}>
              אין פעילות עדיין
            </p>
          ) : (
            <div className="space-y-2">
              {propertyActivities.map((activity) => {
                const typeConfig = ACTIVITY_TYPES.find(
                  (t) => t.id === activity.type
                );
                const isExpanded = expandedActivity === activity.id;

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-3 cursor-pointer"
                    style={{ backgroundColor: '#1E293B' }}
                    onClick={() =>
                      setExpandedActivity(isExpanded ? null : activity.id)
                    }
                  >
                    <div className="flex items-start gap-3">
                      {/* Type icon */}
                      <span className="flex-shrink-0 mt-0.5" style={{ color: '#94A3B8' }}>
                        {(() => {
                          const IconComp = ICON_MAP[typeConfig?.icon] || StickyNote;
                          return <IconComp size={18} />;
                        })()}
                      </span>

                      <div className="flex-1 min-w-0">
                        {/* Title + Timestamp */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-sm font-medium truncate"
                            style={{ color: '#E2E8F0' }}
                          >
                            {activity.title}
                          </span>
                          <span
                            className="text-xs flex-shrink-0"
                            style={{ color: '#64748B' }}
                          >
                            {relativeTime(activity.created_at)}
                          </span>
                        </div>

                        {/* Content (expandable) */}
                        <AnimatePresence>
                          {isExpanded && activity.content && (
                            <motion.p
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-sm mt-2 leading-relaxed overflow-hidden"
                              style={{ color: '#94A3B8' }}
                            >
                              {activity.content}
                            </motion.p>
                          )}
                        </AnimatePresence>

                        {/* Expand indicator if has content */}
                        {activity.content && (
                          <div className="mt-1">
                            {isExpanded ? (
                              <ChevronUp
                                size={14}
                                style={{ color: '#64748B' }}
                              />
                            ) : (
                              <ChevronDown
                                size={14}
                                style={{ color: '#64748B' }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== NOTES ===== */}
        {property.notes && (
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: '#1E293B' }}
          >
            <h3
              className="text-sm font-semibold mb-2"
              style={{ color: '#94A3B8' }}
            >
              הערות
            </h3>
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: '#E2E8F0' }}
            >
              {property.notes}
            </p>
          </div>
        )}

        {/* ===== DELETE BUTTON ===== */}
        <div className="pt-4 pb-8">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer w-full justify-center transition-colors"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgba(239, 68, 68, 0.1)';
            }}
          >
            <Trash2 size={16} />
            מחק נכס
          </button>
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="מחיקת נכס"
        message={`האם אתה בטוח שברצונך למחוק את "${property.name}"? פעולה זו אינה ניתנת לביטול.`}
        onConfirm={handleDelete}
        onClose={() => setShowDeleteConfirm(false)}
        confirmText="כן, מחק"
        cancelText="ביטול"
        variant="danger"
      />
    </div>
  );
}
