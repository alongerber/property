import { motion, AnimatePresence } from 'framer-motion';

const variantStyles = {
  danger: {
    confirm: 'bg-red-500 hover:bg-red-600 text-white',
  },
  warning: {
    confirm: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  info: {
    confirm: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '\u05D0\u05D9\u05E9\u05D5\u05E8',
  cancelText = '\u05D1\u05D9\u05D8\u05D5\u05DC',
  variant = 'danger',
}) {
  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog card */}
          <motion.div
            className="relative w-full max-w-sm rounded-2xl p-6"
            style={{ backgroundColor: '#1E293B' }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            dir="rtl"
          >
            {/* Title */}
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: '#E2E8F0' }}
            >
              {title}
            </h3>

            {/* Message */}
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: '#94A3B8' }}
            >
              {message}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onConfirm}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${styles.confirm}`}
              >
                {confirmText}
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer"
                style={{
                  backgroundColor: '#334155',
                  color: '#94A3B8',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
