import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Send,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Shield,
  DollarSign,
  BarChart3,
  X,
  MessageCircle,
  Info,
} from 'lucide-react';
import useStore from '../store/useStore';
import { AI_PERSONAS } from '../utils/constants';
import { calcMortgage, formatCurrency, getIncomeRatio, getIncomeRatioColor } from '../utils/calculations';

// ─── Animation Variants ───────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ───────────────────────────────────────────────────────────────
//  AI Advisors Page
// ───────────────────────────────────────────────────────────────
export default function AiAdvisors() {
  const [expandedCard, setExpandedCard] = useState(null);

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl font-bold" style={{ color: '#E2E8F0' }}>
          יועצי AI
        </h1>
        <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
          תובנות אוטומטיות מבוססות נתוני הנכסים שלך
        </p>
      </motion.div>

      {/* Persona Cards */}
      {AI_PERSONAS.map((persona) => (
        <PersonaCard
          key={persona.id}
          persona={persona}
          isExpanded={expandedCard === persona.id}
          onToggle={() => setExpandedCard(expandedCard === persona.id ? null : persona.id)}
        />
      ))}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PERSONA CARD
// ═══════════════════════════════════════════════════════════════
function PersonaCard({ persona, isExpanded, onToggle }) {
  const tasks = useStore((s) => s.tasks);

  // Count tasks referencing this advisor persona conceptually
  const taskCount = tasks.filter((t) => !t.is_done).length;

  return (
    <motion.div
      variants={itemVariants}
      layout
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: '#1E293B', borderColor: '#334155' }}
    >
      {/* ─── Collapsed Header ──────────────────────────── */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-white/[0.03]"
      >
        {/* Icon circle */}
        <div
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 text-2xl"
          style={{ backgroundColor: persona.color + '30' }}
        >
          {persona.icon}
        </div>

        {/* Name + domain */}
        <div className="flex-1 text-start">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold" style={{ color: '#E2E8F0' }}>
              {persona.name}
            </span>
            {taskCount > 0 && (
              <span
                className="text-xs font-mono rounded-full px-2 py-0.5"
                style={{ backgroundColor: persona.color + '25', color: persona.color }}
              >
                {taskCount}
              </span>
            )}
          </div>
          <span className="text-sm" style={{ color: '#94A3B8' }}>
            {persona.domain}
          </span>
        </div>

        {/* Expand chevron */}
        {isExpanded ? (
          <ChevronUp size={20} style={{ color: '#64748B' }} />
        ) : (
          <ChevronDown size={20} style={{ color: '#64748B' }} />
        )}
      </button>

      {/* ─── Expanded Panel ────────────────────────────── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-5 flex flex-col gap-4"
              style={{ borderTop: '1px solid #334155' }}
            >
              {/* Insights */}
              <div className="pt-4">
                {persona.id === 'lawyer' && <LawyerInsights />}
                {persona.id === 'mortgage' && <MortgageInsights />}
                {persona.id === 'appraiser' && <AppraiserInsights />}
              </div>

              {/* Chat */}
              <ChatInterface persona={persona} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  LAWYER INSIGHTS
// ═══════════════════════════════════════════════════════════════
function LawyerInsights() {
  const properties = useStore((s) => s.properties);
  const activeProperties = properties.filter((p) => p.status !== 'dropped');

  // Keywords that flag legal issues
  const RISK_KEYWORDS = ['קליניקה', 'בנייה', 'חריגה', 'היתר', 'עיקול', 'משכון', 'הפקעה', 'זיקת הנאה'];

  const LEGAL_CHECKLIST = [
    'בדיקת נסח טאבו עדכני',
    'אימות היתר בנייה וזיהוי חריגות',
    'בדיקת שעבודים ועיקולים',
    'זכויות בנייה נוספות / תב"ע',
    'חוב היטל השבחה',
    'בדיקת תקנון בית משותף',
    'אישור עירייה על היעדר חובות',
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Per-property risk assessment */}
      {activeProperties.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#E2E8F0' }}>
            <Shield size={14} style={{ color: '#8B1A1A' }} />
            הערכת סיכונים לפי נכס
          </h4>
          {activeProperties.map((prop) => {
            const risks = prop.risks || [];
            const flaggedRisks = risks.filter((r) =>
              RISK_KEYWORDS.some((kw) => r.toLowerCase().includes(kw.toLowerCase()))
            );
            const hasFlags = flaggedRisks.length > 0;

            return (
              <div
                key={prop.id}
                className="rounded-lg border p-3 flex flex-col gap-2"
                style={{
                  backgroundColor: '#0F172A',
                  borderColor: hasFlags ? '#EF444440' : '#334155',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: prop.color || '#3B82F6' }}
                    />
                    <span className="text-sm font-medium" style={{ color: '#E2E8F0' }}>
                      {prop.name}
                    </span>
                  </div>
                  {hasFlags ? (
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#EF4444' }}>
                      <AlertTriangle size={12} />
                      {flaggedRisks.length} סיכונים
                    </span>
                  ) : risks.length === 0 ? (
                    <span className="text-xs" style={{ color: '#64748B' }}>
                      לא הוזנו סיכונים
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#10B981' }}>
                      <CheckCircle2 size={12} />
                      תקין
                    </span>
                  )}
                </div>

                {/* Flagged risks list */}
                {flaggedRisks.length > 0 && (
                  <div className="flex flex-col gap-1 mr-4">
                    {flaggedRisks.map((risk, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                        <span className="text-xs" style={{ color: '#F87171' }}>
                          {risk}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Non-flagged risks */}
                {risks.length > 0 && flaggedRisks.length < risks.length && (
                  <div className="flex flex-col gap-1 mr-4">
                    {risks
                      .filter((r) => !flaggedRisks.includes(r))
                      .map((risk, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#94A3B8' }} />
                          <span className="text-xs" style={{ color: '#94A3B8' }}>
                            {risk}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legal checklist */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#E2E8F0' }}>
          <CheckCircle2 size={14} style={{ color: '#10B981' }} />
          צ'קליסט משפטי כללי
        </h4>
        <div
          className="rounded-lg border p-3 flex flex-col gap-2"
          style={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
        >
          {LEGAL_CHECKLIST.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                style={{ borderColor: '#334155' }}
              />
              <span className="text-xs" style={{ color: '#94A3B8' }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MORTGAGE INSIGHTS
// ═══════════════════════════════════════════════════════════════
function MortgageInsights() {
  const properties = useStore((s) => s.properties);
  const netIncome = useStore((s) => s.netIncome);
  const mortgageYears = useStore((s) => s.mortgageYears);
  const mortgageRate = useStore((s) => s.mortgageRate);
  const totalEquity = useStore((s) => s.totalEquity);

  const activeProperties = properties.filter((p) => p.status !== 'dropped');
  const maxMonthly = Math.round(netIncome * 0.33);
  const equity = totalEquity();

  return (
    <div className="flex flex-col gap-4">
      {/* Summary box */}
      <div
        className="rounded-lg border p-4 flex flex-col gap-3"
        style={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
      >
        <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#E2E8F0' }}>
          <DollarSign size={14} style={{ color: '#1B4965' }} />
          יכולת החזר חודשית
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <span className="text-xs" style={{ color: '#64748B' }}>הכנסה נטו</span>
            <span className="text-sm font-mono font-semibold" style={{ color: '#E2E8F0' }}>
              {formatCurrency(netIncome)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs" style={{ color: '#64748B' }}>מקסימום 33%</span>
            <span className="text-sm font-mono font-bold" style={{ color: '#F59E0B' }}>
              {formatCurrency(maxMonthly)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs" style={{ color: '#64748B' }}>הון עצמי</span>
            <span className="text-sm font-mono font-semibold" style={{ color: '#10B981' }}>
              {formatCurrency(equity)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs" style={{ color: '#64748B' }}>תקופה / ריבית</span>
            <span className="text-sm font-mono font-semibold" style={{ color: '#E2E8F0' }}>
              {mortgageYears} שנה / {mortgageRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Recommended mix */}
      <div
        className="rounded-lg border p-3 flex items-start gap-3"
        style={{ backgroundColor: '#1B496510', borderColor: '#1B496540' }}
      >
        <Info size={16} style={{ color: '#3B82F6', marginTop: 2 }} className="shrink-0" />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium" style={{ color: '#E2E8F0' }}>
            תמהיל מומלץ
          </span>
          <span className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>
            מומלץ לפצל את המשכנתא ל-3 מסלולים: שליש פריים (P+0.5%), שליש קבועה צמודה (~3.5%), ושליש קבועה לא צמודה (~5%). כך תפזרו סיכון ותוכלו לפרוע חלקים לפי תנאי השוק.
          </span>
        </div>
      </div>

      {/* Per-property analysis */}
      {activeProperties.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#E2E8F0' }}>
            <BarChart3 size={14} style={{ color: '#1B4965' }} />
            בדיקת החזר לפי נכס
          </h4>
          {activeProperties.map((prop) => {
            const price = prop.price || 0;
            const mortgageAmount = Math.max(0, price - equity);
            const monthly = calcMortgage(mortgageAmount, mortgageRate, mortgageYears);
            const ratio = getIncomeRatio(monthly, netIncome);
            const ratioColor = getIncomeRatioColor(ratio);
            const withinRange = ratio <= 33;

            return (
              <div
                key={prop.id}
                className="rounded-lg border p-3 flex flex-col gap-2"
                style={{
                  backgroundColor: '#0F172A',
                  borderColor: withinRange ? '#33415560' : '#EF444440',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: prop.color || '#3B82F6' }}
                    />
                    <span className="text-sm font-medium" style={{ color: '#E2E8F0' }}>
                      {prop.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono" style={{ color: '#64748B' }}>
                    {formatCurrency(price)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs" style={{ color: '#64748B' }}>
                      משכנתא: {formatCurrency(mortgageAmount)}
                    </span>
                    <span className="text-xs" style={{ color: '#64748B' }}>
                      החזר חודשי: {formatCurrency(Math.round(monthly))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold" style={{ color: ratioColor }}>
                      {ratio.toFixed(1)}%
                    </span>
                    {withinRange ? (
                      <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                    ) : (
                      <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                    )}
                  </div>
                </div>

                {/* Visual bar */}
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#334155' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(ratio, 100)}%`,
                      backgroundColor: ratioColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  APPRAISER INSIGHTS
// ═══════════════════════════════════════════════════════════════
function AppraiserInsights() {
  const properties = useStore((s) => s.properties);
  const activeProperties = properties.filter((p) => p.status !== 'dropped');

  // Price per sqm comparison
  const withSqm = activeProperties.filter((p) => p.price && p.size_sqm && p.size_sqm > 0);
  const pricePerSqmData = withSqm.map((p) => ({
    ...p,
    pricePerSqm: Math.round(p.price / p.size_sqm),
  }));

  const avgPricePerSqm =
    pricePerSqmData.length > 0
      ? Math.round(pricePerSqmData.reduce((s, p) => s + p.pricePerSqm, 0) / pricePerSqmData.length)
      : 0;

  // Days on market analysis
  const now = new Date();
  const withDom = activeProperties.filter((p) => p.created_at);
  const domData = withDom.map((p) => {
    const days = Math.floor((now.getTime() - new Date(p.created_at).getTime()) / 86400000);
    return { ...p, daysOnMarket: days };
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Price per sqm comparison */}
      {pricePerSqmData.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#E2E8F0' }}>
            <BarChart3 size={14} style={{ color: '#2D6A4F' }} />
            השוואת מחיר למ"ר
          </h4>

          {/* Average indicator */}
          <div
            className="rounded-lg border p-3 flex items-center justify-between"
            style={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
          >
            <span className="text-xs" style={{ color: '#94A3B8' }}>
              ממוצע מחיר למ"ר בנכסים שלך
            </span>
            <span className="text-sm font-mono font-bold" style={{ color: '#10B981' }}>
              {formatCurrency(avgPricePerSqm)} / מ"ר
            </span>
          </div>

          {/* Per-property bars */}
          {pricePerSqmData
            .sort((a, b) => a.pricePerSqm - b.pricePerSqm)
            .map((prop) => {
              const deviation = avgPricePerSqm > 0
                ? ((prop.pricePerSqm - avgPricePerSqm) / avgPricePerSqm) * 100
                : 0;
              const isAbove = deviation > 0;
              const maxBar = Math.max(...pricePerSqmData.map((p) => p.pricePerSqm));
              const barWidth = maxBar > 0 ? (prop.pricePerSqm / maxBar) * 100 : 0;

              return (
                <div
                  key={prop.id}
                  className="rounded-lg border p-3 flex flex-col gap-2"
                  style={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: prop.color || '#3B82F6' }}
                      />
                      <span className="text-sm font-medium" style={{ color: '#E2E8F0' }}>
                        {prop.name}
                      </span>
                      <span className="text-xs" style={{ color: '#64748B' }}>
                        {prop.size_sqm} מ"ר
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: '#E2E8F0' }}>
                        {formatCurrency(prop.pricePerSqm)}
                      </span>
                      <span
                        className="text-xs font-mono flex items-center gap-0.5"
                        style={{ color: isAbove ? '#EF4444' : '#10B981' }}
                      >
                        {isAbove ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(deviation).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Visual bar */}
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#334155' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: prop.color || '#3B82F6' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Days on market */}
      {domData.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#E2E8F0' }}>
            <TrendingUp size={14} style={{ color: '#2D6A4F' }} />
            ימים במעקב
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {domData.map((prop) => (
              <div
                key={prop.id}
                className="rounded-lg border p-3 flex items-center justify-between"
                style={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: prop.color || '#3B82F6' }}
                  />
                  <span className="text-sm" style={{ color: '#E2E8F0' }}>
                    {prop.name}
                  </span>
                </div>
                <span
                  className="text-sm font-mono font-semibold"
                  style={{ color: prop.daysOnMarket > 30 ? '#F59E0B' : '#94A3B8' }}
                >
                  {prop.daysOnMarket} ימים
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {activeProperties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <BarChart3 size={40} style={{ color: '#64748B' }} strokeWidth={1.5} />
          <p className="mt-3 text-sm" style={{ color: '#94A3B8' }}>
            הוסיפו נכסים כדי לראות ניתוח שמאי
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CHAT INTERFACE
// ═══════════════════════════════════════════════════════════════
function ChatInterface({ persona }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const aiMessage = {
      id: crypto.randomUUID(),
      role: 'ai',
      text: 'שירות AI יהיה זמין בקרוב',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInput('');
  }

  return (
    <div
      className="rounded-lg border flex flex-col overflow-hidden"
      style={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
    >
      {/* Chat header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: '1px solid #334155' }}
      >
        <MessageCircle size={14} style={{ color: '#64748B' }} />
        <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>
          צ'אט עם {persona.name}
        </span>
      </div>

      {/* Messages area */}
      <div
        className="flex flex-col gap-2 p-3 overflow-y-auto"
        style={{ minHeight: 120, maxHeight: 280 }}
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center py-6">
            <span className="text-xs" style={{ color: '#64748B' }}>
              שלחו הודעה כדי להתחיל שיחה
            </span>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex"
            style={{
              justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end',
            }}
          >
            <div
              className="rounded-lg px-3 py-2 max-w-[80%]"
              style={{
                backgroundColor: msg.role === 'user' ? '#3B82F620' : '#33415560',
                border: `1px solid ${msg.role === 'user' ? '#3B82F640' : '#33415580'}`,
              }}
            >
              <p className="text-sm" style={{ color: msg.role === 'user' ? '#93C5FD' : '#94A3B8' }}>
                {msg.text}
              </p>
              <span className="text-[10px] mt-1 block" style={{ color: '#64748B' }}>
                {new Date(msg.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 p-2"
        style={{ borderTop: '1px solid #334155' }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`שאלו את ${persona.name}...`}
          className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
          style={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            color: '#E2E8F0',
          }}
          onFocus={(e) => (e.target.style.borderColor = persona.color)}
          onBlur={(e) => (e.target.style.borderColor = '#334155')}
        />
        <button
          type="submit"
          className="rounded-lg p-2.5 cursor-pointer transition-colors shrink-0"
          style={{ backgroundColor: persona.color, color: '#FFFFFF' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
