export const PIPELINE_STATUSES = [
  { id: 'pipeline_new', label: 'חדשה', color: '#3B82F6' },
  { id: 'researched', label: 'נחקרה', color: '#8B5CF6' },
  { id: 'toured', label: 'סיור', color: '#F59E0B' },
  { id: 'negotiating', label: 'מו״מ', color: '#F97316' },
  { id: 'contract', label: 'חוזה', color: '#10B981' },
  { id: 'closed', label: 'נסגרה', color: '#059669' },
  { id: 'dropped', label: 'נפלה', color: '#EF4444' },
];

export const ACTIVITY_TYPES = [
  { id: 'call', label: 'שיחה', icon: 'Phone' },
  { id: 'visit', label: 'סיור', icon: 'MapPin' },
  { id: 'document', label: 'מסמך', icon: 'FileText' },
  { id: 'decision', label: 'החלטה', icon: 'CheckCircle2' },
  { id: 'note', label: 'הערה', icon: 'StickyNote' },
  { id: 'whatsapp', label: 'וואטסאפ', icon: 'MessageSquare' },
  { id: 'email', label: 'אימייל', icon: 'Mail' },
  { id: 'negotiation', label: 'מו״מ', icon: 'HandCoins' },
];

export const AI_PERSONAS = [
  { id: 'lawyer', icon: '⚖️', name: 'עו״ד נדל״ן', color: '#8B1A1A', domain: 'חריגות בנייה, היתרים, טאבו' },
  { id: 'mortgage', icon: '🏦', name: 'יועץ משכנתאות', color: '#1B4965', domain: 'תמהיל, ריביות, כושר החזר' },
  { id: 'appraiser', icon: '📊', name: 'שמאי / אנליסט', color: '#2D6A4F', domain: 'שווי שוק, מגמות, פוטנציאל' },
];

export const DEFAULT_EQUITY_SOURCES = [
  { id: 'ducifat', label: 'מכירת חצי דוכיפת', min_amount: 1200000, max_amount: 1600000, current_estimate: 1450000, is_confirmed: false, notes: 'בסיס שווי 2.9M', sort_order: 0 },
  { id: 'inheritance', label: 'ירושה מאבטליון', min_amount: 0, max_amount: 500000, current_estimate: 200000, is_confirmed: false, notes: 'סכום לא ידוע', sort_order: 1 },
  { id: 'keren', label: 'קרן השתלמות / פיצויים', min_amount: 0, max_amount: 300000, current_estimate: 150000, is_confirmed: false, notes: '', sort_order: 2 },
  { id: 'savings', label: 'חסכונות / פיקדונות', min_amount: 0, max_amount: 200000, current_estimate: 80000, is_confirmed: false, notes: '', sort_order: 3 },
];

export const DECISION_CRITERIA = [
  'מחיר', 'מיקום', 'מצב הדירה', 'גינה', 'בטיחות (ממ״ד)', 'פוטנציאל השבחה', 'חניות', 'סיכון משפטי',
];

export const PROPERTY_COLORS = [
  '#2D6A4F', '#3B82F6', '#8B5CF6', '#F59E0B', '#F97316', '#EF4444', '#EC4899', '#06B6D4',
];

export const DEADLINE_DATE = new Date('2026-04-01');
