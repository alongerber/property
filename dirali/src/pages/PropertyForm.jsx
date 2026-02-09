import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, X, Save, ArrowRight, Check } from 'lucide-react';
import useStore from '../store/useStore';
import { PROPERTY_COLORS } from '../utils/constants';

// ---------------------------------------------------------------------------
// Dynamic list component (add / remove string items)
// ---------------------------------------------------------------------------
function DynamicList({ items, onChange, placeholder, accentColor = '#3B82F6' }) {
  const [inputValue, setInputValue] = useState('');

  const addItem = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
      setInputValue('');
    }
  };

  const removeItem = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div>
      {/* Existing items */}
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item, idx) => (
          <span
            key={idx}
            className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full"
            style={{
              backgroundColor: `${accentColor}1A`,
              color: accentColor,
              border: `1px solid ${accentColor}33`,
            }}
          >
            {item}
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="cursor-pointer hover:opacity-70"
              style={{ color: accentColor }}
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>

      {/* Add input */}
      <div className="flex items-center gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className="flex-1 text-sm rounded-lg px-3 py-2"
          style={{
            backgroundColor: '#0F172A',
            border: '1px solid #334155',
            color: '#E2E8F0',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={addItem}
          className="p-2 rounded-lg cursor-pointer transition-colors"
          style={{ color: accentColor }}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
function Section({ title, children }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
    >
      <h3
        className="text-base font-semibold mb-4"
        style={{ color: '#E2E8F0' }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Input field wrapper
// ---------------------------------------------------------------------------
function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label
        className="block text-sm font-medium mb-1.5"
        style={{ color: '#94A3B8' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reusable input style
// ---------------------------------------------------------------------------
const inputStyle = {
  backgroundColor: '#0F172A',
  border: '1px solid #334155',
  color: '#E2E8F0',
  outline: 'none',
};

const inputFocusClass =
  'w-full text-sm rounded-lg px-3 py-2.5 transition-colors focus:border-blue-500';

// ---------------------------------------------------------------------------
// Main PropertyForm component
// ---------------------------------------------------------------------------
export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const existingProperty = useStore((s) =>
    id ? s.properties.find((p) => p.id === id) : null
  );
  const addProperty = useStore((s) => s.addProperty);
  const updateProperty = useStore((s) => s.updateProperty);

  // ----- form state -----
  const [form, setForm] = useState({
    name: '',
    street: '',
    city: 'נשר',
    listing_url: '',
    rooms: '',
    sqm_built: '',
    sqm_garden: '',
    floor: '',
    parking_spots: '',
    has_storage: false,
    has_elevator: false,
    has_mamad: false,
    has_accessible: false,
    price: '',
    condition: '',
    renovation_estimate: '',
    entry_date: '',
    broker_name: '',
    broker_phone: '',
    broker_license: '',
    highlights: [],
    risks: [],
    features: [],
    notes: '',
    color: PROPERTY_COLORS[0],
  });

  // Populate form if editing
  useEffect(() => {
    if (isEdit && existingProperty) {
      setForm({
        name: existingProperty.name || '',
        street: existingProperty.street || '',
        city: existingProperty.city || 'נשר',
        listing_url: existingProperty.listing_url || '',
        rooms: existingProperty.rooms ?? '',
        sqm_built: existingProperty.sqm_built ?? '',
        sqm_garden: existingProperty.sqm_garden ?? '',
        floor: existingProperty.floor ?? '',
        parking_spots: existingProperty.parking_spots ?? '',
        has_storage: existingProperty.has_storage || false,
        has_elevator: existingProperty.has_elevator || false,
        has_mamad: existingProperty.has_mamad || false,
        has_accessible: existingProperty.has_accessible || false,
        price: existingProperty.price ?? '',
        condition: existingProperty.condition || '',
        renovation_estimate: existingProperty.renovation_estimate ?? '',
        entry_date: existingProperty.entry_date || '',
        broker_name: existingProperty.broker_name || '',
        broker_phone: existingProperty.broker_phone || '',
        broker_license: existingProperty.broker_license || '',
        highlights: existingProperty.highlights || [],
        risks: existingProperty.risks || [],
        features: existingProperty.features || [],
        notes: existingProperty.notes || '',
        color: existingProperty.color || PROPERTY_COLORS[0],
      });
    }
  }, [isEdit, existingProperty]);

  // ----- helpers -----
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      ...form,
      price: form.price ? Number(form.price) : 0,
      rooms: form.rooms ? Number(form.rooms) : null,
      sqm_built: form.sqm_built ? Number(form.sqm_built) : null,
      sqm_garden: form.sqm_garden ? Number(form.sqm_garden) : null,
      parking_spots: form.parking_spots ? Number(form.parking_spots) : null,
      renovation_estimate: form.renovation_estimate
        ? Number(form.renovation_estimate)
        : 0,
    };

    if (isEdit) {
      updateProperty(id, data);
      navigate(`/properties/${id}`);
    } else {
      addProperty(data);
      navigate('/properties');
    }
  };

  // Guard for edit mode with missing property
  if (isEdit && !existingProperty) {
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
        <button
          onClick={() => navigate('/properties')}
          className="px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer mt-4"
          style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
        >
          חזרה לנכסים
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              navigate(isEdit ? `/properties/${id}` : '/properties')
            }
            className="p-2 rounded-lg cursor-pointer"
            style={{ color: '#94A3B8' }}
          >
            <ArrowRight size={20} />
          </button>
          <h1
            className="text-xl font-bold"
            style={{ color: '#E2E8F0' }}
          >
            {isEdit ? 'עריכת נכס' : 'נכס חדש'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ===== 1. Basic Details ===== */}
        <Section title="פרטים בסיסיים">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="שם הנכס" className="md:col-span-2">
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder='לדוגמה: "דירת גן ברחוב הזית"'
                required
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>

            <Field label="רחוב">
              <input
                value={form.street}
                onChange={(e) => updateField('street', e.target.value)}
                placeholder="רחוב ומספר"
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>

            <Field label="עיר">
              <input
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="עיר"
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>

            <Field label="קישור למודעה" className="md:col-span-2">
              <input
                value={form.listing_url}
                onChange={(e) => updateField('listing_url', e.target.value)}
                placeholder="https://..."
                type="url"
                dir="ltr"
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>
          </div>
        </Section>

        {/* ===== 2. Characteristics ===== */}
        <Section title="מאפיינים">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="חדרים">
              <input
                value={form.rooms}
                onChange={(e) => updateField('rooms', e.target.value)}
                type="number"
                step="0.5"
                min="0"
                placeholder="3.5"
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>

            <Field label='מ״ר בנוי'>
              <input
                value={form.sqm_built}
                onChange={(e) => updateField('sqm_built', e.target.value)}
                type="number"
                min="0"
                placeholder="85"
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>

            <Field label='מ״ר גינה'>
              <input
                value={form.sqm_garden}
                onChange={(e) => updateField('sqm_garden', e.target.value)}
                type="number"
                min="0"
                placeholder="40"
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>

            <Field label="קומה">
              <input
                value={form.floor}
                onChange={(e) => updateField('floor', e.target.value)}
                placeholder="קרקע / 2 מתוך 5"
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>

            <Field label="חניות">
              <input
                value={form.parking_spots}
                onChange={(e) => updateField('parking_spots', e.target.value)}
                type="number"
                min="0"
                placeholder="1"
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>
          </div>
        </Section>

        {/* ===== 3. Boolean Features ===== */}
        <Section title="תכונות">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'has_storage', label: 'מחסן' },
              { key: 'has_elevator', label: 'מעלית' },
              { key: 'has_mamad', label: 'ממ"ד' },
              { key: 'has_accessible', label: 'נגישות' },
            ].map((feat) => (
              <label
                key={feat.key}
                className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors"
                style={{
                  backgroundColor: form[feat.key]
                    ? `${form.color}1A`
                    : '#0F172A',
                  border: `1px solid ${
                    form[feat.key] ? `${form.color}44` : '#334155'
                  }`,
                }}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: form[feat.key]
                      ? form.color
                      : 'transparent',
                    border: form[feat.key]
                      ? 'none'
                      : '2px solid #475569',
                  }}
                >
                  {form[feat.key] && (
                    <Check size={14} style={{ color: '#FFFFFF' }} />
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={form[feat.key]}
                  onChange={(e) => updateField(feat.key, e.target.checked)}
                  className="sr-only"
                />
                <span
                  className="text-sm"
                  style={{
                    color: form[feat.key] ? '#E2E8F0' : '#94A3B8',
                  }}
                >
                  {feat.label}
                </span>
              </label>
            ))}
          </div>
        </Section>

        {/* ===== 4. Pricing ===== */}
        <Section title="מחיר">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="מחיר (₪)">
              <input
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                type="number"
                min="0"
                step="1000"
                placeholder="1,750,000"
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>

            <Field label="מצב הדירה">
              <input
                value={form.condition}
                onChange={(e) => updateField('condition', e.target.value)}
                placeholder="חדשה / משופצת / דורשת שיפוץ"
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>

            <Field label="הערכת שיפוץ (₪)">
              <input
                value={form.renovation_estimate}
                onChange={(e) =>
                  updateField('renovation_estimate', e.target.value)
                }
                type="number"
                min="0"
                step="1000"
                placeholder="100,000"
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>

            <Field label="תאריך כניסה">
              <input
                value={form.entry_date}
                onChange={(e) => updateField('entry_date', e.target.value)}
                type="date"
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>
          </div>
        </Section>

        {/* ===== 5. Broker ===== */}
        <Section title="תיווך">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="שם מתווך">
              <input
                value={form.broker_name}
                onChange={(e) => updateField('broker_name', e.target.value)}
                placeholder="שם"
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>

            <Field label="טלפון מתווך">
              <input
                value={form.broker_phone}
                onChange={(e) => updateField('broker_phone', e.target.value)}
                placeholder="050-1234567"
                type="tel"
                dir="ltr"
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>

            <Field label="רישיון מתווך">
              <input
                value={form.broker_license}
                onChange={(e) => updateField('broker_license', e.target.value)}
                placeholder="מספר רישיון"
                dir="ltr"
                className={inputFocusClass}
                style={inputStyle}
              />
            </Field>
          </div>
        </Section>

        {/* ===== 6. Evaluations ===== */}
        <Section title="הערכות">
          <div className="space-y-5">
            {/* Highlights */}
            <Field label="יתרונות">
              <DynamicList
                items={form.highlights}
                onChange={(val) => updateField('highlights', val)}
                placeholder="הוסף יתרון..."
                accentColor="#10B981"
              />
            </Field>

            {/* Risks */}
            <Field label="סיכונים">
              <DynamicList
                items={form.risks}
                onChange={(val) => updateField('risks', val)}
                placeholder="הוסף סיכון..."
                accentColor="#EF4444"
              />
            </Field>

            {/* Features / Tags */}
            <Field label="תגיות / תכונות">
              <DynamicList
                items={form.features}
                onChange={(val) => updateField('features', val)}
                placeholder="הוסף תגית..."
                accentColor={form.color}
              />
            </Field>

            {/* Notes */}
            <Field label="הערות">
              <textarea
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="הערות חופשיות..."
                rows={4}
                className="w-full text-sm rounded-lg px-3 py-2.5 resize-none"
                style={{
                  ...inputStyle,
                  transition: 'border-color 0.2s',
                }}
              />
            </Field>
          </div>
        </Section>

        {/* ===== 7. Color Picker ===== */}
        <Section title="צבע הנכס">
          <div className="flex flex-wrap gap-3">
            {PROPERTY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateField('color', c)}
                className="w-10 h-10 rounded-xl cursor-pointer transition-transform flex items-center justify-center"
                style={{
                  backgroundColor: c,
                  transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                  boxShadow:
                    form.color === c
                      ? `0 0 0 3px #0B1120, 0 0 0 5px ${c}`
                      : 'none',
                }}
              >
                {form.color === c && (
                  <Check size={18} style={{ color: '#FFFFFF' }} />
                )}
              </button>
            ))}
          </div>
        </Section>

        {/* ===== Submit ===== */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold cursor-pointer transition-colors"
          style={{
            backgroundColor: form.color || '#3B82F6',
            color: '#FFFFFF',
          }}
        >
          <Save size={18} />
          {isEdit ? 'שמור שינויים' : 'הוסף נכס'}
        </motion.button>
      </form>
    </div>
  );
}
