import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Building2,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  ArrowLeft,
  Phone,
  Footprints,
  FileText,
  CheckSquare,
  StickyNote,
  MessageCircle,
  Mail,
  HandCoins,
  Sparkles,
} from 'lucide-react';
import useStore from '../store/useStore';
import { formatCurrency, relativeTime } from '../utils/calculations';
import { PIPELINE_STATUSES, ACTIVITY_TYPES } from '../utils/constants';
import { useDeadline } from '../hooks/useDeadline';
import PropertyMiniCard from '../components/property/PropertyMiniCard';
import StatusPill from '../components/property/StatusPill';

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

// ─── Activity type → Lucide icon mapping ──────────────────────
const ACTIVITY_ICON_MAP = {
  call: Phone,
  visit: Footprints,
  document: FileText,
  decision: CheckSquare,
  note: StickyNote,
  whatsapp: MessageCircle,
  email: Mail,
  negotiation: HandCoins,
};

// ─── Helpers ──────────────────────────────────────────────────
function getActivityIcon(type) {
  return ACTIVITY_ICON_MAP[type] || StickyNote;
}

function getActivityTypeLabel(type) {
  const found = ACTIVITY_TYPES.find((t) => t.id === type);
  return found ? found.label : type;
}

// ───────────────────────────────────────────────────────────────
//  Dashboard Page
// ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { daysLeft, isUrgent } = useDeadline();

  const properties = useStore((s) => s.properties);
  const tasks = useStore((s) => s.tasks);
  const activities = useStore((s) => s.activities);
  const totalEquity = useStore((s) => s.totalEquity);
  const toggleTask = useStore((s) => s.toggleTask);

  // Derived data
  const activeProperties = properties.filter((p) => p.status !== 'dropped');
  const urgentTasks = tasks.filter((t) => t.priority === 'high' && !t.is_done);
  const completedTasks = tasks.filter((t) => t.is_done);
  const recentActivities = activities.slice(0, 5);

  // Deadline date formatted
  const deadlineFormatted = new Date('2026-04-01').toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Property lookup helper
  function getPropertyById(id) {
    return properties.find((p) => p.id === id);
  }

  // ─── 1. Deadline Banner ───────────────────────────────────
  function DeadlineBanner() {
    const bgGradient = isUrgent
      ? 'linear-gradient(to left, #7F1D1D, #991B1B)'
      : 'linear-gradient(to left, #1E3A5F, #1B4965)';

    const taskProgress =
      tasks.length > 0
        ? Math.round((completedTasks.length / tasks.length) * 100)
        : 0;

    return (
      <motion.div
        variants={itemVariants}
        className="rounded-xl overflow-hidden"
        style={{ background: bgGradient }}
      >
        <div className="flex items-center justify-between px-6 py-5">
          {/* Right side — deadline info */}
          <div className="flex flex-col gap-1">
            <span className="text-white/70 text-sm">
              דדליין &mdash; סוף חוזה שכירות
            </span>
            <span className="text-white font-bold text-lg">{deadlineFormatted}</span>
          </div>

          {/* Left side — giant days number */}
          <div className="flex items-baseline gap-2">
            <span
              className="font-mono font-black text-white leading-none"
              style={{ fontSize: '42px' }}
            >
              {daysLeft}
            </span>
            <span className="text-white/70 text-sm">ימים</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white/60 text-xs">
              {completedTasks.length}/{tasks.length} משימות הושלמו
            </span>
            <span className="text-white/60 text-xs font-mono">{taskProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: '#10B981' }}
              initial={{ width: 0 }}
              animate={{ width: `${taskProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── 2. Quick Stats Row ───────────────────────────────────
  function QuickStats() {
    const stats = [
      {
        label: 'הון עצמי',
        value: formatCurrency(totalEquity()),
        color: '#10B981',
        icon: TrendingUp,
        mono: true,
      },
      {
        label: 'דירות במעקב',
        value: activeProperties.length,
        color: '#3B82F6',
        icon: Building2,
        mono: false,
      },
      {
        label: 'משימות דחופות',
        value: urgentTasks.length,
        color: urgentTasks.length > 0 ? '#EF4444' : '#10B981',
        icon: AlertTriangle,
        mono: false,
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="rounded-xl border px-5 py-4 flex items-center gap-4"
              style={{
                backgroundColor: '#1E293B',
                borderColor: '#334155',
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: stat.color + '18' }}
              >
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm" style={{ color: '#94A3B8' }}>
                  {stat.label}
                </span>
                <span
                  className={`text-xl font-bold ${stat.mono ? 'font-mono' : ''}`}
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // ─── 3. Pipeline Overview ─────────────────────────────────
  function PipelineOverview() {
    return (
      <motion.div variants={itemVariants}>
        <h2
          className="text-lg font-bold mb-3"
          style={{ color: '#E2E8F0' }}
        >
          סטטוס צנרת
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {PIPELINE_STATUSES.map((status) => {
            const matching = properties.filter((p) => p.status === status.id);
            return (
              <div
                key={status.id}
                className="rounded-xl border px-4 py-3 min-w-[140px] shrink-0 flex flex-col gap-2"
                style={{
                  backgroundColor: '#1E293B',
                  borderColor: '#334155',
                }}
              >
                {/* Status header */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: status.color }}
                  >
                    {status.label}
                  </span>
                  <span
                    className="text-xs font-mono rounded-full w-5 h-5 flex items-center justify-center"
                    style={{
                      backgroundColor: status.color + '22',
                      color: status.color,
                    }}
                  >
                    {matching.length}
                  </span>
                </div>

                {/* Property pills */}
                <div className="flex flex-col gap-1.5">
                  {matching.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => navigate(`/properties/${prop.id}`)}
                      className="rounded-md px-2.5 py-1 text-xs font-medium text-white text-start truncate transition-opacity hover:opacity-80 cursor-pointer"
                      style={{ backgroundColor: prop.color || status.color }}
                    >
                      {prop.name}
                    </button>
                  ))}
                  {matching.length === 0 && (
                    <span className="text-xs" style={{ color: '#64748B' }}>
                      &mdash;
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // ─── 4. Property Cards Grid ───────────────────────────────
  function PropertyGrid() {
    return (
      <motion.div variants={itemVariants}>
        <h2
          className="text-lg font-bold mb-3"
          style={{ color: '#E2E8F0' }}
        >
          הדירות שלי
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProperties.map((property) => (
            <PropertyMiniCard key={property.id} property={property} />
          ))}

          {/* AI Import card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/properties/import')}
            className="rounded-xl border flex flex-col items-center justify-center gap-3 py-10 cursor-pointer transition-all"
            style={{
              borderColor: '#8B5CF640',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.08) 100%)',
              color: '#A78BFA',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#8B5CF6';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.15) 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#8B5CF640';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.08) 100%)';
            }}
          >
            <Sparkles size={28} />
            <span className="text-sm font-medium">ייבוא חכם עם AI</span>
            <span className="text-xs" style={{ color: '#94A3B8' }}>הדביקו טקסט מודעה</span>
          </motion.button>

          {/* Manual add card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/properties/new')}
            className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-10 cursor-pointer transition-colors"
            style={{
              borderColor: '#334155',
              backgroundColor: 'transparent',
              color: '#64748B',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3B82F6';
              e.currentTarget.style.color = '#3B82F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.color = '#64748B';
            }}
          >
            <Plus size={28} />
            <span className="text-sm font-medium">+ הוסף ידנית</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ─── 5. Urgent Tasks ──────────────────────────────────────
  function UrgentTasksList() {
    if (urgentTasks.length === 0) return null;

    return (
      <motion.div variants={itemVariants}>
        <h2
          className="text-lg font-bold mb-3 flex items-center gap-2"
          style={{ color: '#E2E8F0' }}
        >
          <AlertTriangle size={18} style={{ color: '#EF4444' }} />
          משימות דחופות
        </h2>
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            backgroundColor: '#1E293B',
            borderColor: '#334155',
          }}
        >
          {urgentTasks.map((task, idx) => {
            const prop = getPropertyById(task.property_id);
            return (
              <motion.button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-start cursor-pointer transition-colors hover:bg-white/5"
                style={{
                  borderRight: '3px solid #EF4444',
                  borderBottom:
                    idx < urgentTasks.length - 1 ? '1px solid #334155' : 'none',
                }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Checkbox */}
                <div className="shrink-0">
                  {task.is_done ? (
                    <CheckCircle2 size={18} style={{ color: '#10B981' }} />
                  ) : (
                    <Circle size={18} style={{ color: '#64748B' }} />
                  )}
                </div>

                {/* Task text */}
                <span
                  className="flex-1 text-sm"
                  style={{
                    color: task.is_done ? '#64748B' : '#E2E8F0',
                    textDecoration: task.is_done ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </span>

                {/* Property name badge */}
                {prop && (
                  <span
                    className="text-xs rounded-md px-2 py-0.5 shrink-0"
                    style={{
                      backgroundColor: (prop.color || '#3B82F6') + '22',
                      color: prop.color || '#3B82F6',
                    }}
                  >
                    {prop.name}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // ─── 6. Recent Activity Feed ──────────────────────────────
  function RecentActivityFeed() {
    if (recentActivities.length === 0) return null;

    return (
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-lg font-bold"
            style={{ color: '#E2E8F0' }}
          >
            פעילות אחרונה
          </h2>
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-1 text-sm cursor-pointer transition-colors hover:opacity-80"
            style={{ color: '#3B82F6' }}
          >
            צפה בכל
            <ArrowLeft size={14} />
          </button>
        </div>
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            backgroundColor: '#1E293B',
            borderColor: '#334155',
          }}
        >
          {recentActivities.map((activity, idx) => {
            const prop = getPropertyById(activity.property_id);
            const Icon = getActivityIcon(activity.type);

            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  borderBottom:
                    idx < recentActivities.length - 1
                      ? '1px solid #334155'
                      : 'none',
                }}
              >
                {/* Type icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#334155' }}
                >
                  <Icon size={16} style={{ color: '#94A3B8' }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm truncate"
                      style={{ color: '#E2E8F0' }}
                    >
                      {activity.title}
                    </span>
                    {prop && (
                      <span
                        className="text-xs rounded-md px-2 py-0.5 shrink-0"
                        style={{
                          backgroundColor: (prop.color || '#3B82F6') + '22',
                          color: prop.color || '#3B82F6',
                        }}
                      >
                        {prop.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={11} style={{ color: '#64748B' }} />
                    <span className="text-xs" style={{ color: '#64748B' }}>
                      {relativeTime(activity.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <DeadlineBanner />
      <QuickStats />
      <PipelineOverview />
      <PropertyGrid />
      <UrgentTasksList />
      <RecentActivityFeed />
    </motion.div>
  );
}
