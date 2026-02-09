import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  ClipboardPaste,
  Check,
  Loader2,
  ArrowLeft,
  Building2,
  Edit3,
} from 'lucide-react';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/calculations';
import { PROPERTY_COLORS } from '../utils/constants';

// ─── Animation Variants ───────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ─── Field Preview Card ──────────────────────────────────────
function FieldCard({ label, value, color = '#3B82F6' }) {
  if (value === null || value === undefined || value === '') return null;

  let display = value;
  if (typeof value === 'boolean') {
    display = value ? (
      <span className="flex items-center gap-1" style={{ color: '#10B981' }}>
        <Check size={14} /> כן
      </span>
    ) : (
      <span style={{ color: '#64748B' }}>לא</span>
    );
  } else if (typeof value === 'number') {
    display = (
      <span className="font-mono" style={{ color }}>
        {value.toLocaleString('he-IL')}
      </span>
    );
  }

  return (
    <div
      className="rounded-lg p-3 flex flex-col gap-1"
      style={{ backgroundColor: '#0F172A', border: '1px solid #334155' }}
    >
      <span className="text-xs font-medium" style={{ color: '#64748B' }}>
        {label}
      </span>
      <span className="text-sm font-medium" style={{ color: '#E2E8F0' }}>
        {display}
      </span>
    </div>
  );
}

// ─── Pill ────────────────────────────────────────────────────
function Pill({ text, color = '#3B82F6' }) {
  return (
    <span
      className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full"
      style={{
        backgroundColor: `${color}1A`,
        color,
        border: `1px solid ${color}33`,
      }}
    >
      {text}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function PropertyImport() {
  const navigate = useNavigate();
  const addProperty = useStore((s) => s.addProperty);

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState(null);
  const [saved, setSaved] = useState(false);

  // ─── API Call ───────────────────────────────────────────────
  async function handleImport() {
    if (!text.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/parse-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'שגיאה בניתוח המודעה');
      }

      setParsed(data.property);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ─── Save Property ─────────────────────────────────────────
  function handleSave() {
    if (!parsed) return;

    addProperty({
      name: parsed.name || 'נכס חדש',
      street: parsed.street || '',
      city: parsed.city || '',
      rooms: parsed.rooms || null,
      sqm_built: parsed.sqm_built || null,
      sqm_garden: parsed.sqm_garden || 0,
      floor: parsed.floor || '',
      parking_spots: parsed.parking_spots || 0,
      has_storage: parsed.has_storage || false,
      has_elevator: parsed.has_elevator || false,
      has_mamad: parsed.has_mamad || false,
      has_accessible: parsed.has_accessible || false,
      price: parsed.price || 0,
      condition: parsed.condition || '',
      renovation_estimate: parsed.renovation_estimate || 0,
      entry_date: parsed.entry_date || '',
      broker_name: parsed.broker_name || '',
      broker_phone: parsed.broker_phone || '',
      features: parsed.features || [],
      highlights: parsed.highlights || [],
      risks: parsed.risks || [],
      notes: parsed.notes || '',
      color: PROPERTY_COLORS[Math.floor(Math.random() * PROPERTY_COLORS.length)],
    });

    setSaved(true);
    setTimeout(() => navigate('/'), 1500);
  }

  // ─── Edit Before Save ──────────────────────────────────────
  function handleEdit() {
    if (!parsed) return;

    navigate('/properties/new', {
      state: {
        prefill: {
          name: parsed.name || '',
          street: parsed.street || '',
          city: parsed.city || '',
          rooms: parsed.rooms ?? '',
          sqm_built: parsed.sqm_built ?? '',
          sqm_garden: parsed.sqm_garden ?? '',
          floor: parsed.floor || '',
          parking_spots: parsed.parking_spots ?? '',
          has_storage: parsed.has_storage || false,
          has_elevator: parsed.has_elevator || false,
          has_mamad: parsed.has_mamad || false,
          has_accessible: parsed.has_accessible || false,
          price: parsed.price ?? '',
          condition: parsed.condition || '',
          renovation_estimate: parsed.renovation_estimate ?? '',
          entry_date: parsed.entry_date || '',
          broker_name: parsed.broker_name || '',
          broker_phone: parsed.broker_phone || '',
          features: parsed.features || [],
          highlights: parsed.highlights || [],
          risks: parsed.risks || [],
          notes: parsed.notes || '',
          color: PROPERTY_COLORS[Math.floor(Math.random() * PROPERTY_COLORS.length)],
        },
      },
    });
  }

  // ─── Reset ─────────────────────────────────────────────────
  function handleReset() {
    setText('');
    setParsed(null);
    setError('');
    setSaved(false);
  }

  // ═══════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28" dir="rtl">
      <AnimatePresence mode="wait">
        {!parsed ? (
          /* ─────────── STATE 1: INPUT MODE ─────────── */
          <motion.div
            key="input"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            className="flex flex-col gap-6"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                  boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
                }}
              >
                <Sparkles size={28} style={{ color: '#FFFFFF' }} />
              </div>
              <h1
                className="text-2xl font-bold mb-2"
                style={{ color: '#E2E8F0' }}
              >
                ייבוא חכם
              </h1>
              <p className="text-sm" style={{ color: '#94A3B8' }}>
                הדבק טקסט מודעה וה-AI יסדר הכל
              </p>
            </motion.div>

            {/* Textarea Card */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl p-1"
              style={{
                background: 'linear-gradient(135deg, #8B5CF620, #3B82F620)',
              }}
            >
              <div
                className="rounded-[10px] p-4"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardPaste size={16} style={{ color: '#8B5CF6' }} />
                  <span className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                    טקסט המודעה
                  </span>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="הדביקו כאן טקסט מודעה מ-Yad2, פייסבוק, או כל מקור אחר..."
                  rows={8}
                  className="w-full text-sm rounded-lg px-4 py-3 resize-none transition-colors"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid #334155',
                    color: '#E2E8F0',
                    outline: 'none',
                    minHeight: 200,
                    lineHeight: 1.7,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#8B5CF6')}
                  onBlur={(e) => (e.target.style.borderColor = '#334155')}
                />
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg p-3 text-sm text-center"
                style={{
                  backgroundColor: '#EF44441A',
                  border: '1px solid #EF444433',
                  color: '#F87171',
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Import Button */}
            <motion.button
              variants={itemVariants}
              onClick={handleImport}
              disabled={loading || !text.trim()}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-base font-semibold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? 'linear-gradient(135deg, #6D28D9, #2563EB)'
                  : 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                color: '#FFFFFF',
                boxShadow: text.trim()
                  ? '0 4px 24px rgba(139, 92, 246, 0.35)'
                  : 'none',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>מנתח את המודעה...</span>
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  <span>ייבא עם AI</span>
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          /* ─────────── STATE 2: REVIEW MODE ─────────── */
          <motion.div
            key="review"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            className="flex flex-col gap-5"
          >
            {/* Success Badge */}
            <motion.div variants={fadeIn} className="text-center">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  background: 'linear-gradient(135deg, #10B98120, #059669120)',
                  border: '1px solid #10B98140',
                  color: '#10B981',
                }}
              >
                <Check size={16} />
                המודעה נותחה בהצלחה
              </div>
            </motion.div>

            {/* Property Name Header */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl p-5"
              style={{
                background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                border: '1px solid #334155',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                  }}
                >
                  <Building2 size={22} style={{ color: '#FFFFFF' }} />
                </div>
                <div className="flex-1">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: '#E2E8F0' }}
                  >
                    {parsed.name || 'נכס חדש'}
                  </h2>
                  {(parsed.street || parsed.city) && (
                    <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>
                      {[parsed.street, parsed.city].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Price highlight */}
              {parsed.price > 0 && (
                <div
                  className="mt-3 rounded-lg px-4 py-3 flex items-center justify-between"
                  style={{
                    backgroundColor: '#8B5CF610',
                    border: '1px solid #8B5CF625',
                  }}
                >
                  <span className="text-sm" style={{ color: '#94A3B8' }}>
                    מחיר
                  </span>
                  <span
                    className="text-lg font-bold font-mono"
                    style={{ color: '#A78BFA' }}
                  >
                    {formatCurrency(parsed.price)}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Parsed Fields Grid */}
            <motion.div variants={itemVariants}>
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: '#94A3B8' }}
              >
                פרטי הנכס
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <FieldCard label="חדרים" value={parsed.rooms} color="#8B5CF6" />
                <FieldCard label='מ"ר בנוי' value={parsed.sqm_built} color="#3B82F6" />
                <FieldCard label='מ"ר גינה' value={parsed.sqm_garden > 0 ? parsed.sqm_garden : null} color="#10B981" />
                <FieldCard label="קומה" value={parsed.floor} />
                <FieldCard label="חניות" value={parsed.parking_spots} color="#F59E0B" />
                <FieldCard label="מצב" value={parsed.condition} />
                <FieldCard label="מחסן" value={parsed.has_storage} />
                <FieldCard label="מעלית" value={parsed.has_elevator} />
                <FieldCard label='ממ"ד' value={parsed.has_mamad} />
                <FieldCard label="נגישות" value={parsed.has_accessible} />
                <FieldCard label="תאריך כניסה" value={parsed.entry_date} />
                {parsed.renovation_estimate > 0 && (
                  <FieldCard
                    label="הערכת שיפוץ"
                    value={formatCurrency(parsed.renovation_estimate)}
                    color="#F59E0B"
                  />
                )}
              </div>
            </motion.div>

            {/* Broker Info */}
            {(parsed.broker_name || parsed.broker_phone) && (
              <motion.div variants={itemVariants}>
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: '#94A3B8' }}
                >
                  פרטי מתווך
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <FieldCard label="שם" value={parsed.broker_name} />
                  <FieldCard label="טלפון" value={parsed.broker_phone} />
                </div>
              </motion.div>
            )}

            {/* Features */}
            {parsed.features && parsed.features.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: '#94A3B8' }}
                >
                  תכונות
                </h3>
                <div className="flex flex-wrap gap-2">
                  {parsed.features.map((f, i) => (
                    <Pill key={i} text={f} color="#8B5CF6" />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Highlights */}
            {parsed.highlights && parsed.highlights.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3
                  className="text-sm font-semibold mb-3 flex items-center gap-2"
                  style={{ color: '#10B981' }}
                >
                  <Check size={14} />
                  יתרונות
                </h3>
                <div className="flex flex-col gap-2">
                  {parsed.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="rounded-lg px-3 py-2.5 flex items-start gap-2"
                      style={{
                        backgroundColor: '#10B9811A',
                        border: '1px solid #10B98125',
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: '#10B981' }}
                      />
                      <span className="text-sm" style={{ color: '#6EE7B7' }}>
                        {h}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Risks */}
            {parsed.risks && parsed.risks.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3
                  className="text-sm font-semibold mb-3 flex items-center gap-2"
                  style={{ color: '#EF4444' }}
                >
                  <Sparkles size={14} />
                  סיכונים
                </h3>
                <div className="flex flex-col gap-2">
                  {parsed.risks.map((r, i) => (
                    <div
                      key={i}
                      className="rounded-lg px-3 py-2.5 flex items-start gap-2"
                      style={{
                        backgroundColor: '#EF44441A',
                        border: '1px solid #EF444425',
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: '#EF4444' }}
                      />
                      <span className="text-sm" style={{ color: '#FCA5A5' }}>
                        {r}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Notes */}
            {parsed.notes && (
              <motion.div
                variants={itemVariants}
                className="rounded-lg p-3"
                style={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                }}
              >
                <span className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>
                  הערות
                </span>
                <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                  {parsed.notes}
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col gap-3 mt-2">
              {/* Save / Success */}
              <AnimatePresence mode="wait">
                {saved ? (
                  <motion.div
                    key="saved"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: '#FFFFFF',
                    }}
                  >
                    <Check size={20} />
                    <span>הנכס נשמר בהצלחה!</span>
                  </motion.div>
                ) : (
                  <motion.button
                    key="save"
                    onClick={handleSave}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-semibold cursor-pointer transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 24px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <Check size={20} />
                    <span>שמור נכס</span>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Edit Before Save */}
              {!saved && (
                <motion.button
                  onClick={handleEdit}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium cursor-pointer transition-all"
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    color: '#94A3B8',
                  }}
                >
                  <Edit3 size={16} />
                  <span>ערוך לפני שמירה</span>
                </motion.button>
              )}

              {/* Start Over */}
              {!saved && (
                <button
                  onClick={handleReset}
                  className="text-sm cursor-pointer py-2 transition-colors"
                  style={{ color: '#64748B', background: 'none', border: 'none' }}
                  onMouseEnter={(e) => (e.target.style.color = '#94A3B8')}
                  onMouseLeave={(e) => (e.target.style.color = '#64748B')}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <ArrowLeft size={14} />
                    התחל מחדש
                  </span>
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
