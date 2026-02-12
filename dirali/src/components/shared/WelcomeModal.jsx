import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Diamond, Building2, Bot, ArrowLeft, X } from 'lucide-react';

const STEPS = [
  {
    icon: Diamond,
    color: '#3B82F6',
    title: 'ברוכים הבאים לדירה לי',
    body: 'הכלי שלכם לניהול תהליך רכישת דירה — מעקב נכסים, חישוב משכנתא, ובינה מלאכותית שעוזרת לקבל החלטות.',
  },
  {
    icon: Building2,
    color: '#10B981',
    title: 'הוסיפו נכסים',
    body: 'הדביקו טקסט מודעה בייבוא חכם או הוסיפו ידנית. עקבו אחרי סטטוס, מחיר, ומשכנתא לכל נכס.',
  },
  {
    icon: Bot,
    color: '#8B5CF6',
    title: 'קבלו ייעוץ AI',
    body: '5 יועצים מומחים — עו"ד, יועץ משכנתאות, שמאי, קבלן ומנהל פרויקט — מנתחים כל נכס ועוזרים לכם להחליט.',
  },
];

export default function WelcomeModal() {
  const [visible, setVisible] = useState(() => {
    return !localStorage.getItem('dirali-welcomed');
  });
  const [step, setStep] = useState(0);

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const handleClose = () => {
    localStorage.setItem('dirali-welcomed', '1');
    setVisible(false);
  };

  const handleNext = () => {
    if (isLast) {
      handleClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70]"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-[71] inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto rounded-2xl p-6"
            style={{
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}
            dir="rtl"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 left-3 p-1 rounded-lg cursor-pointer"
              style={{ color: '#64748B' }}
              aria-label="סגור"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${current.color}18` }}
              >
                <Icon size={32} style={{ color: current.color }} />
              </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <h2 className="text-lg font-bold mb-2" style={{ color: '#E2E8F0' }}>
                  {current.title}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                  {current.body}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Step dots */}
            <div className="flex justify-center gap-2 mt-5 mb-4">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 24 : 8,
                    height: 8,
                    backgroundColor: i === step ? current.color : '#334155',
                  }}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                style={{ backgroundColor: current.color, color: '#fff' }}
              >
                {isLast ? 'בואו נתחיל' : 'הבא'}
                {!isLast && <ArrowLeft size={16} />}
              </button>
              {!isLast && (
                <button
                  onClick={handleClose}
                  className="px-4 py-3 rounded-xl text-sm cursor-pointer transition-colors"
                  style={{ color: '#64748B' }}
                >
                  דלג
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
