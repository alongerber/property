import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  Calendar,
  Flag,
  ChevronDown,
  ChevronUp,
  Target,
  Milestone,
  ListTodo,
  X,
} from 'lucide-react';
import useStore from '../store/useStore';
import { DEADLINE_DATE } from '../utils/constants';

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

// ─── Helpers ──────────────────────────────────────────────────
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const DEADLINE = new Date(DEADLINE_DATE);
DEADLINE.setHours(0, 0, 0, 0);

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}

function formatDateHe(dateStr) {
  return new Date(dateStr).toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
  });
}

// ───────────────────────────────────────────────────────────────
//  Timeline Page
// ───────────────────────────────────────────────────────────────
export default function Timeline() {
  const milestones = useStore((s) => s.milestones);
  const toggleMilestone = useStore((s) => s.toggleMilestone);
  const addMilestone = useStore((s) => s.addMilestone);
  const properties = useStore((s) => s.properties);

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newPropertyId, setNewPropertyId] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Sort milestones by date
  const sortedMilestones = useMemo(() => {
    return [...milestones].sort(
      (a, b) => new Date(a.target_date) - new Date(b.target_date)
    );
  }, [milestones]);

  // Calculate timeline range: earliest milestone or today, whichever is earlier
  const timelineRange = useMemo(() => {
    const allDates = sortedMilestones.map((m) => new Date(m.target_date).getTime());
    allDates.push(TODAY.getTime());
    allDates.push(DEADLINE.getTime());

    const earliest = new Date(Math.min(...allDates));
    const latest = new Date(Math.max(...allDates));

    // Add 3-day padding on each side
    const start = new Date(earliest);
    start.setDate(start.getDate() - 3);
    const end = new Date(latest);
    end.setDate(end.getDate() + 3);

    return { start, end, totalDays: daysBetween(start, end) };
  }, [sortedMilestones]);

  function getPosition(dateStr) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const daysFromStart = daysBetween(timelineRange.start, d);
    return Math.max(0, Math.min(100, (daysFromStart / timelineRange.totalDays) * 100));
  }

  const todayPosition = getPosition(TODAY.toISOString());

  function getMilestoneColor(milestone) {
    const milestoneDate = new Date(milestone.target_date);
    milestoneDate.setHours(0, 0, 0, 0);

    if (milestone.is_completed) return '#10B981'; // green
    if (milestoneDate < TODAY) return '#EF4444'; // red — missed
    return '#3B82F6'; // blue — future
  }

  function getMilestoneStatus(milestone) {
    const milestoneDate = new Date(milestone.target_date);
    milestoneDate.setHours(0, 0, 0, 0);

    if (milestone.is_completed) return 'completed';
    if (milestoneDate < TODAY) return 'missed';
    return 'upcoming';
  }

  function handleAddMilestone(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;
    addMilestone({
      title: newTitle.trim(),
      target_date: newDate,
      property_id: newPropertyId || null,
      sort_order: milestones.length,
    });
    setNewTitle('');
    setNewDate('');
    setNewPropertyId('');
    setShowForm(false);
  }

  function getProperty(id) {
    return properties.find((p) => p.id === id);
  }

  // Timeline scroll ref
  const timelineRef = useRef(null);

  // On mount, scroll to center today marker
  useEffect(() => {
    if (timelineRef.current) {
      const container = timelineRef.current;
      const todayPixel = (todayPosition / 100) * container.scrollWidth;
      container.scrollLeft = todayPixel - container.clientWidth / 2;
    }
  }, [todayPosition]);

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#E2E8F0' }}>
            ציר זמן
          </h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
            מעקב אבני דרך עד {formatDateHe(DEADLINE.toISOString())}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium cursor-pointer transition-colors"
          style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3B82F6')}
        >
          <Plus size={16} />
          אבן דרך
        </button>
      </motion.div>

      {/* ─── Add Milestone Form ───────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddMilestone}
            className="rounded-xl border p-4 flex flex-col gap-3 overflow-hidden"
            style={{ backgroundColor: '#1E293B', borderColor: '#334155' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>
                אבן דרך חדשה
              </span>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="cursor-pointer p-1 rounded-md"
                style={{ color: '#64748B' }}
              >
                <X size={16} />
              </button>
            </div>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="שם אבן הדרך..."
              autoFocus
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                color: '#E2E8F0',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3B82F6')}
              onBlur={(e) => (e.target.style.borderColor = '#334155')}
            />

            <div className="flex gap-3">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm outline-none flex-1"
                style={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  color: '#E2E8F0',
                }}
              />
              <select
                value={newPropertyId}
                onChange={(e) => setNewPropertyId(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm outline-none cursor-pointer flex-1"
                style={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  color: '#E2E8F0',
                }}
              >
                <option value="">כללי (ללא נכס)</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg px-4 py-2 text-sm font-medium cursor-pointer transition-colors"
                style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3B82F6')}
              >
                הוסף
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ─── Horizontal Timeline ──────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl border p-5 overflow-hidden"
        style={{ backgroundColor: '#1E293B', borderColor: '#334155' }}
      >
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          {[
            { color: '#10B981', label: 'הושלם' },
            { color: '#EF4444', label: 'חורג' },
            { color: '#3B82F6', label: 'עתידי' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs" style={{ color: '#94A3B8' }}>
                {item.label}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5" style={{ backgroundColor: '#EF4444', borderTop: '2px dashed #EF4444' }} />
            <span className="text-xs" style={{ color: '#94A3B8' }}>
              היום
            </span>
          </div>
        </div>

        {/* Timeline container */}
        <div
          ref={timelineRef}
          className="relative overflow-x-auto pb-4"
          style={{ minHeight: 180 }}
        >
          <div className="relative" style={{ minWidth: Math.max(700, sortedMilestones.length * 120) }}>
            {/* Timeline bar */}
            <div
              className="absolute top-[70px] right-0 left-0 h-1 rounded-full"
              style={{ backgroundColor: '#334155' }}
            />

            {/* Filled portion up to today */}
            <div
              className="absolute top-[70px] h-1 rounded-full"
              style={{
                backgroundColor: '#3B82F640',
                right: 0,
                width: `${todayPosition}%`,
              }}
            />

            {/* Today marker — vertical dashed line */}
            <div
              className="absolute top-2 flex flex-col items-center"
              style={{
                right: `${todayPosition}%`,
                transform: 'translateX(50%)',
                zIndex: 10,
              }}
            >
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded mb-1"
                style={{ backgroundColor: '#EF444430', color: '#EF4444' }}
              >
                היום
              </span>
              <div
                className="w-0 border-r-2 border-dashed"
                style={{ borderColor: '#EF4444', height: 140 }}
              />
            </div>

            {/* Deadline marker */}
            {(() => {
              const deadlinePos = getPosition(DEADLINE.toISOString());
              return (
                <div
                  className="absolute top-2 flex flex-col items-center"
                  style={{
                    right: `${deadlinePos}%`,
                    transform: 'translateX(50%)',
                    zIndex: 9,
                  }}
                >
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded mb-1"
                    style={{ backgroundColor: '#F59E0B30', color: '#F59E0B' }}
                  >
                    <Flag size={10} className="inline ml-1" />
                    דדליין
                  </span>
                  <div
                    className="w-0 border-r-2 border-dashed"
                    style={{ borderColor: '#F59E0B60', height: 140 }}
                  />
                </div>
              );
            })()}

            {/* Milestone markers */}
            {sortedMilestones.map((milestone, idx) => {
              const pos = getPosition(milestone.target_date);
              const color = getMilestoneColor(milestone);
              const status = getMilestoneStatus(milestone);
              const isSelected = selectedMilestone === milestone.id;

              return (
                <div
                  key={milestone.id}
                  className="absolute flex flex-col items-center"
                  style={{
                    right: `${pos}%`,
                    transform: 'translateX(50%)',
                    top: 40,
                    zIndex: isSelected ? 20 : 5,
                  }}
                >
                  {/* Label above */}
                  <motion.div
                    className="text-center mb-2 whitespace-nowrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <span
                      className="text-[11px] font-medium block"
                      style={{ color: isSelected ? '#FFFFFF' : '#94A3B8' }}
                    >
                      {milestone.title}
                    </span>
                    <span className="text-[10px]" style={{ color: '#64748B' }}>
                      {formatDateShort(milestone.target_date)}
                    </span>
                  </motion.div>

                  {/* Circle marker */}
                  <motion.button
                    onClick={() => {
                      toggleMilestone(milestone.id);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedMilestone(isSelected ? null : milestone.id);
                    }}
                    className="cursor-pointer relative"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    title="לחצו לסימון הושלם | קליק ימני לצפייה במשימות"
                  >
                    {/* Glow ring for selected */}
                    {isSelected && (
                      <motion.div
                        className="absolute rounded-full"
                        style={{
                          width: 28,
                          height: 28,
                          top: -4,
                          right: -4,
                          border: `2px solid ${color}`,
                          opacity: 0.5,
                        }}
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{
                        backgroundColor: milestone.is_completed ? color : '#0B1120',
                        borderColor: color,
                      }}
                    >
                      {milestone.is_completed && (
                        <CheckCircle2 size={12} style={{ color: '#FFFFFF' }} />
                      )}
                      {status === 'missed' && !milestone.is_completed && (
                        <AlertTriangle size={10} style={{ color }} />
                      )}
                    </div>
                  </motion.button>

                  {/* Connector line down */}
                  <div
                    className="w-0.5 mt-1"
                    style={{ height: 16, backgroundColor: color + '40' }}
                  />

                  {/* Status tag below */}
                  <button
                    onClick={() => setSelectedMilestone(isSelected ? null : milestone.id)}
                    className="mt-1 cursor-pointer"
                  >
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: color + '20',
                        color,
                      }}
                    >
                      {status === 'completed' ? 'הושלם' : status === 'missed' ? 'חורג!' : `${daysBetween(TODAY, new Date(milestone.target_date))} ימים`}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ─── Milestones List (vertical) ───────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#E2E8F0' }}>
          <Target size={16} style={{ color: '#3B82F6' }} />
          כל אבני הדרך
        </h2>
        {sortedMilestones.map((milestone) => {
          const color = getMilestoneColor(milestone);
          const status = getMilestoneStatus(milestone);
          const prop = getProperty(milestone.property_id);
          const isSelected = selectedMilestone === milestone.id;
          const milestoneDate = new Date(milestone.target_date);
          const daysAway = daysBetween(TODAY, milestoneDate);

          return (
            <motion.div
              key={milestone.id}
              layout
              className="rounded-xl border overflow-hidden transition-all"
              style={{
                backgroundColor: '#1E293B',
                borderColor: isSelected ? color + '60' : '#334155',
              }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/[0.03]"
                onClick={() => setSelectedMilestone(isSelected ? null : milestone.id)}
              >
                {/* Toggle button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMilestone(milestone.id);
                  }}
                  className="shrink-0 cursor-pointer"
                  style={{ width: 20, height: 20 }}
                >
                  {milestone.is_completed ? (
                    <CheckCircle2 size={20} style={{ color: '#10B981' }} />
                  ) : status === 'missed' ? (
                    <AlertTriangle size={20} style={{ color: '#EF4444' }} />
                  ) : (
                    <Circle size={20} style={{ color: '#3B82F6' }} />
                  )}
                </button>

                {/* Title */}
                <span
                  className="flex-1 text-sm font-medium"
                  style={{
                    color: milestone.is_completed ? '#64748B' : '#E2E8F0',
                    textDecoration: milestone.is_completed ? 'line-through' : 'none',
                  }}
                >
                  {milestone.title}
                </span>

                {/* Property pill */}
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

                {/* Date + days away */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono" style={{ color: '#64748B' }}>
                    {formatDateShort(milestone.target_date)}
                  </span>
                  {!milestone.is_completed && (
                    <span
                      className="text-xs font-mono rounded-full px-2 py-0.5"
                      style={{
                        backgroundColor: color + '15',
                        color,
                      }}
                    >
                      {daysAway > 0 ? `${daysAway} ימים` : daysAway === 0 ? 'היום' : `${Math.abs(daysAway)}- ימים`}
                    </span>
                  )}
                </div>

                {isSelected ? (
                  <ChevronUp size={16} style={{ color: '#64748B' }} />
                ) : (
                  <ChevronDown size={16} style={{ color: '#64748B' }} />
                )}
              </div>

              {/* Linked tasks */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <LinkedTasksPanel milestoneId={milestone.id} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  LINKED TASKS PANEL
// ═══════════════════════════════════════════════════════════════
function LinkedTasksPanel({ milestoneId }) {
  const milestones = useStore((s) => s.milestones);
  const tasks = useStore((s) => s.tasks);
  const properties = useStore((s) => s.properties);
  const toggleTask = useStore((s) => s.toggleTask);

  const milestone = milestones.find((m) => m.id === milestoneId);
  if (!milestone) return null;

  // Find linked tasks: match by property_id or general tasks for general milestones
  const linkedTasks = milestone.property_id
    ? tasks.filter((t) => t.property_id === milestone.property_id)
    : tasks.filter((t) => !t.property_id);

  function getProperty(id) {
    return properties.find((p) => p.id === id);
  }

  return (
    <div
      className="px-4 pb-4 flex flex-col gap-2"
      style={{ borderTop: '1px solid #334155' }}
    >
      <div className="flex items-center gap-2 pt-3 mb-1">
        <ListTodo size={13} style={{ color: '#94A3B8' }} />
        <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>
          משימות קשורות
        </span>
        <span className="text-xs font-mono" style={{ color: '#64748B' }}>
          ({linkedTasks.length})
        </span>
      </div>

      {linkedTasks.length > 0 ? (
        linkedTasks.map((task) => {
          const prop = getProperty(task.property_id);
          return (
            <div
              key={task.id}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.03]"
              style={{ backgroundColor: '#0F172A' }}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="shrink-0 cursor-pointer"
              >
                {task.is_done ? (
                  <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                ) : (
                  <Circle size={16} style={{ color: '#64748B' }} />
                )}
              </button>
              <span
                className="flex-1 text-xs"
                style={{
                  color: task.is_done ? '#64748B' : '#E2E8F0',
                  textDecoration: task.is_done ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </span>
              {task.priority && (
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      task.priority === 'high'
                        ? '#EF4444'
                        : task.priority === 'medium'
                        ? '#F59E0B'
                        : '#3B82F6',
                  }}
                />
              )}
              {prop && (
                <span
                  className="text-[10px] rounded-md px-1.5 py-0.5 shrink-0"
                  style={{
                    backgroundColor: (prop.color || '#3B82F6') + '22',
                    color: prop.color || '#3B82F6',
                  }}
                >
                  {prop.name}
                </span>
              )}
            </div>
          );
        })
      ) : (
        <div className="py-4 text-center">
          <span className="text-xs" style={{ color: '#64748B' }}>
            אין משימות קשורות לאבן דרך זו
          </span>
        </div>
      )}
    </div>
  );
}
