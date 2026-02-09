import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../store/useStore';
import { ACTIVITY_TYPES } from '../../utils/constants';

export default function QuickAddFAB() {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(ACTIVITY_TYPES[0].id);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [text, setText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef(null);

  const properties = useStore((s) => s.properties);
  const addActivity = useStore((s) => s.addActivity);

  // Filter to non-dropped properties
  const activeProperties = properties.filter((p) => p.status !== 'dropped');

  useEffect(() => {
    if (open && inputRef.current) {
      // Small delay so modal animation starts, then focus
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSave = () => {
    if (!text.trim()) return;

    addActivity({
      property_id: selectedProperty,
      type: selectedType,
      title: text.trim(),
      content: '',
      tags: [],
    });

    // Reset & close
    setText('');
    setSelectedType(ACTIVITY_TYPES[0].id);
    setSelectedProperty(null);
    setOpen(false);

    // Show success
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <>
      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed z-[60] left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              bottom: 80,
              backgroundColor: '#10B981',
              color: '#fff',
            }}
          >
            נשמר בהצלחה &#x2713;
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[55]"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed z-[56] inset-x-3 p-4"
            style={{
              bottom: 80,
              backgroundColor: '#1E293B',
              borderRadius: 16,
              border: '1px solid #334155',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-sm font-semibold"
                style={{ color: '#E2E8F0' }}
              >
                הוספה מהירה
              </span>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg transition-colors"
                style={{ color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Activity type selector */}
            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              {ACTIVITY_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors flex-shrink-0"
                  style={{
                    backgroundColor:
                      selectedType === type.id
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'transparent',
                    border:
                      selectedType === type.id
                        ? '1px solid rgba(59, 130, 246, 0.4)'
                        : '1px solid transparent',
                  }}
                >
                  <span className="text-base leading-none">{type.icon}</span>
                  <span
                    className="text-[10px]"
                    style={{
                      color:
                        selectedType === type.id ? '#3B82F6' : '#94A3B8',
                    }}
                  >
                    {type.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Property selector */}
            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedProperty(null)}
                className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors"
                style={{
                  backgroundColor:
                    selectedProperty === null
                      ? 'rgba(59, 130, 246, 0.2)'
                      : 'rgba(51, 65, 85, 0.5)',
                  color: selectedProperty === null ? '#3B82F6' : '#94A3B8',
                  border:
                    selectedProperty === null
                      ? '1px solid rgba(59, 130, 246, 0.4)'
                      : '1px solid #334155',
                }}
              >
                כללי
              </button>
              {activeProperties.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => setSelectedProperty(prop.id)}
                  className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors"
                  style={{
                    backgroundColor:
                      selectedProperty === prop.id
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'rgba(51, 65, 85, 0.5)',
                    color:
                      selectedProperty === prop.id ? '#3B82F6' : '#94A3B8',
                    border:
                      selectedProperty === prop.id
                        ? '1px solid rgba(59, 130, 246, 0.4)'
                        : '1px solid #334155',
                  }}
                >
                  {prop.name || prop.address || 'ללא שם'}
                </button>
              ))}
            </div>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="מה קרה?"
              className="w-full px-3 py-2.5 rounded-xl text-sm mb-3 outline-none transition-colors"
              style={{
                backgroundColor: '#0F172A',
                color: '#E2E8F0',
                border: '1px solid #334155',
                borderRadius: 10,
              }}
            />

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={!text.trim()}
              className="w-full py-2.5 text-sm font-semibold transition-all"
              style={{
                backgroundColor: text.trim()
                  ? '#10B981'
                  : 'rgba(16, 185, 129, 0.3)',
                color: text.trim() ? '#fff' : 'rgba(255,255,255,0.5)',
                borderRadius: 10,
                cursor: text.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              שמור
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        whileTap={{ scale: 0.9 }}
        className="fixed z-[55] flex items-center justify-center shadow-lg"
        style={{
          bottom: 72,
          left: 16,
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
        }}
      >
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus size={26} strokeWidth={2.5} />
        </motion.div>
      </motion.button>
    </>
  );
}
