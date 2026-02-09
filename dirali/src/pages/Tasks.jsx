import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Circle,
  CheckCircle2,
  Trash2,
  Clock,
  ListTodo,
  Activity,
  ChevronDown,
  ChevronUp,
  Phone,
  Footprints,
  FileText,
  CheckSquare,
  StickyNote,
  MessageCircle,
  Mail,
  HandCoins,
  Pencil,
  X,
  Filter,
  Calendar,
} from 'lucide-react';
import useStore from '../store/useStore';
import { relativeTime } from '../utils/calculations';
import { ACTIVITY_TYPES } from '../utils/constants';

// ─── Animation Variants ───────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
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

const ACTIVITY_COLOR_MAP = {
  call: '#3B82F6',
  visit: '#F59E0B',
  document: '#8B5CF6',
  decision: '#10B981',
  note: '#94A3B8',
  whatsapp: '#22C55E',
  email: '#06B6D4',
  negotiation: '#F97316',
};

const PRIORITY_CONFIG = {
  high: { label: 'גבוהה', color: '#EF4444', headerBg: '#EF444418', order: 0 },
  medium: { label: 'בינונית', color: '#F59E0B', headerBg: '#F59E0B18', order: 1 },
  low: { label: 'נמוכה', color: '#3B82F6', headerBg: '#3B82F618', order: 2 },
};

// ───────────────────────────────────────────────────────────────
//  Tasks & Activity Page
// ───────────────────────────────────────────────────────────────
export default function Tasks() {
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Tab Toggle ─────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: '#1E293B' }}>
        {[
          { id: 'tasks', label: 'משימות', icon: ListTodo },
          { id: 'activity', label: 'יומן פעילות', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: isActive ? '#3B82F6' : 'transparent',
                color: isActive ? '#FFFFFF' : '#94A3B8',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'tasks' ? (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <TasksView />
          </motion.div>
        ) : (
          <motion.div
            key="activity"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <ActivityFeedView />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TASKS VIEW
// ═══════════════════════════════════════════════════════════════
function TasksView() {
  const tasks = useStore((s) => s.tasks);
  const properties = useStore((s) => s.properties);
  const addTask = useStore((s) => s.addTask);
  const toggleTask = useStore((s) => s.toggleTask);
  const deleteTask = useStore((s) => s.deleteTask);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [propertyId, setPropertyId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [hoveredTask, setHoveredTask] = useState(null);

  function handleAddTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      priority,
      property_id: propertyId || null,
      due_date: dueDate || null,
    });
    setTitle('');
    setPriority('medium');
    setPropertyId('');
    setDueDate('');
    setShowForm(false);
  }

  // Separate active tasks and completed tasks
  const activeTasks = tasks.filter((t) => !t.is_done);
  const completedTasks = tasks.filter((t) => t.is_done);

  // Group active tasks by priority
  const groupedTasks = useMemo(() => {
    const groups = { high: [], medium: [], low: [] };
    activeTasks.forEach((t) => {
      const p = t.priority || 'medium';
      if (groups[p]) groups[p].push(t);
      else groups.medium.push(t);
    });
    return groups;
  }, [activeTasks]);

  function getProperty(id) {
    return properties.find((p) => p.id === id);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Add Task Button / Inline Form ──────────────── */}
      <AnimatePresence>
        {!showForm ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed transition-colors cursor-pointer"
            style={{ borderColor: '#334155', color: '#94A3B8' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3B82F6';
              e.currentTarget.style.color = '#3B82F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.color = '#94A3B8';
            }}
          >
            <Plus size={18} />
            <span className="text-sm font-medium">+ משימה חדשה</span>
          </motion.button>
        ) : (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddTask}
            className="rounded-xl border p-4 flex flex-col gap-3 overflow-hidden"
            style={{ backgroundColor: '#1E293B', borderColor: '#334155' }}
          >
            {/* Title input */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="תיאור המשימה..."
              autoFocus
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                color: '#E2E8F0',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3B82F6')}
              onBlur={(e) => (e.target.style.borderColor = '#334155')}
            />

            {/* Row: priority + property + due date */}
            <div className="flex flex-wrap gap-3">
              {/* Priority */}
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
                style={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  color: '#E2E8F0',
                }}
              >
                <option value="high">עדיפות גבוהה</option>
                <option value="medium">עדיפות בינונית</option>
                <option value="low">עדיפות נמוכה</option>
              </select>

              {/* Property */}
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
                style={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  color: '#E2E8F0',
                }}
              >
                <option value="">ללא נכס</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* Due date */}
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  color: '#E2E8F0',
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg px-4 py-2 text-sm cursor-pointer transition-colors"
                style={{ color: '#94A3B8' }}
              >
                ביטול
              </button>
              <button
                type="submit"
                className="rounded-lg px-4 py-2 text-sm font-medium cursor-pointer transition-colors"
                style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3B82F6')}
              >
                הוסף משימה
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ─── Priority Groups ────────────────────────────── */}
      {['high', 'medium', 'low'].map((priorityKey) => {
        const group = groupedTasks[priorityKey];
        if (group.length === 0) return null;
        const config = PRIORITY_CONFIG[priorityKey];

        return (
          <motion.div
            key={priorityKey}
            variants={itemVariants}
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: '#1E293B', borderColor: '#334155' }}
          >
            {/* Group header */}
            <div
              className="flex items-center gap-2 px-4 py-2.5"
              style={{ backgroundColor: config.headerBg }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-sm font-semibold" style={{ color: config.color }}>
                {config.label}
              </span>
              <span className="text-xs font-mono" style={{ color: config.color + 'AA' }}>
                ({group.length})
              </span>
            </div>

            {/* Tasks */}
            <AnimatePresence>
              {group.map((task, idx) => {
                const prop = getProperty(task.property_id);
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_done;
                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
                    style={{
                      borderBottom: idx < group.length - 1 ? '1px solid #334155' : 'none',
                    }}
                    onMouseEnter={() => setHoveredTask(task.id)}
                    onMouseLeave={() => setHoveredTask(null)}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="shrink-0 cursor-pointer"
                      style={{ width: 20, height: 20 }}
                    >
                      {task.is_done ? (
                        <CheckCircle2 size={20} style={{ color: '#10B981' }} />
                      ) : (
                        <Circle size={20} style={{ color: '#64748B' }} />
                      )}
                    </button>

                    {/* Title */}
                    <span
                      className="flex-1 text-sm"
                      style={{
                        color: task.is_done ? '#64748B' : '#E2E8F0',
                        textDecoration: task.is_done ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
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

                    {/* Due date */}
                    {task.due_date && (
                      <span
                        className="text-xs shrink-0 flex items-center gap-1"
                        style={{ color: isOverdue ? '#EF4444' : '#64748B' }}
                      >
                        <Calendar size={12} />
                        {new Date(task.due_date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })}
                      </span>
                    )}

                    {/* Delete button on hover */}
                    <AnimatePresence>
                      {hoveredTask === task.id && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => deleteTask(task.id)}
                          className="shrink-0 cursor-pointer p-1 rounded-md transition-colors"
                          style={{ color: '#EF4444' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EF444418')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* ─── Completed Tasks ────────────────────────────── */}
      {completedTasks.length > 0 && (
        <CompletedSection
          tasks={completedTasks}
          properties={properties}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
        />
      )}

      {/* ─── Empty State ────────────────────────────────── */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <ListTodo size={48} style={{ color: '#64748B' }} strokeWidth={1.5} />
          <p className="mt-4 text-sm" style={{ color: '#94A3B8' }}>
            אין משימות עדיין. הוסיפו משימה חדשה כדי להתחיל.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Completed Tasks (collapsible) ──────────────────────────
function CompletedSection({ tasks, properties, toggleTask, deleteTask }) {
  const [expanded, setExpanded] = useState(false);
  const [hoveredTask, setHoveredTask] = useState(null);

  function getProperty(id) {
    return properties.find((p) => p.id === id);
  }

  return (
    <motion.div variants={itemVariants} className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#1E293B', borderColor: '#334155' }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer transition-colors hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} style={{ color: '#10B981' }} />
          <span className="text-sm font-medium" style={{ color: '#94A3B8' }}>
            הושלמו ({tasks.length})
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={16} style={{ color: '#64748B' }} />
        ) : (
          <ChevronDown size={16} style={{ color: '#64748B' }} />
        )}
      </button>

      {/* Tasks */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {tasks.map((task) => {
              const prop = getProperty(task.property_id);
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
                  style={{
                    opacity: 0.5,
                    borderTop: '1px solid #334155',
                  }}
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="shrink-0 cursor-pointer"
                    style={{ width: 20, height: 20 }}
                  >
                    <CheckCircle2 size={20} style={{ color: '#10B981' }} />
                  </button>
                  <span
                    className="flex-1 text-sm line-through"
                    style={{ color: '#64748B' }}
                  >
                    {task.title}
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
                  <AnimatePresence>
                    {hoveredTask === task.id && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => deleteTask(task.id)}
                        className="shrink-0 cursor-pointer p-1 rounded-md"
                        style={{ color: '#EF4444' }}
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ACTIVITY FEED VIEW
// ═══════════════════════════════════════════════════════════════
function ActivityFeedView() {
  const activities = useStore((s) => s.activities);
  const properties = useStore((s) => s.properties);
  const deleteActivity = useStore((s) => s.deleteActivity);

  const [filterProperty, setFilterProperty] = useState('');
  const [filterTypes, setFilterTypes] = useState([]);
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [hoveredActivity, setHoveredActivity] = useState(null);

  function toggleTypeFilter(typeId) {
    setFilterTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  }

  // Filter activities
  const filtered = useMemo(() => {
    let result = [...activities];
    if (filterProperty) {
      result = result.filter((a) => a.property_id === filterProperty);
    }
    if (filterTypes.length > 0) {
      result = result.filter((a) => filterTypes.includes(a.type));
    }
    return result;
  }, [activities, filterProperty, filterTypes]);

  function getProperty(id) {
    return properties.find((p) => p.id === id);
  }

  function getActivityIcon(type) {
    return ACTIVITY_ICON_MAP[type] || StickyNote;
  }

  function getActivityColor(type) {
    return ACTIVITY_COLOR_MAP[type] || '#94A3B8';
  }

  function getActivityTypeLabel(type) {
    const found = ACTIVITY_TYPES.find((t) => t.id === type);
    return found ? found.label : type;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Filters ────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl border p-4 flex flex-col gap-3"
        style={{ backgroundColor: '#1E293B', borderColor: '#334155' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Filter size={14} style={{ color: '#94A3B8' }} />
          <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>סינון</span>
        </div>

        {/* Property dropdown */}
        <select
          value={filterProperty}
          onChange={(e) => setFilterProperty(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm outline-none cursor-pointer w-full sm:w-auto"
          style={{
            backgroundColor: '#0F172A',
            border: '1px solid #334155',
            color: '#E2E8F0',
          }}
        >
          <option value="">כל הנכסים</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Type multi-select pills */}
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_TYPES.map((type) => {
            const isSelected = filterTypes.includes(type.id);
            const color = ACTIVITY_COLOR_MAP[type.id] || '#94A3B8';
            return (
              <button
                key={type.id}
                onClick={() => toggleTypeFilter(type.id)}
                className="rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: isSelected ? color + '30' : '#0F172A',
                  color: isSelected ? color : '#64748B',
                  border: `1px solid ${isSelected ? color + '60' : '#334155'}`,
                }}
              >
                {type.icon} {type.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Activity List ──────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {filtered.map((activity) => {
              const prop = getProperty(activity.property_id);
              const Icon = getActivityIcon(activity.type);
              const color = getActivityColor(activity.type);
              const isExpanded = expandedActivity === activity.id;

              return (
                <motion.div
                  key={activity.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border overflow-hidden"
                  style={{ backgroundColor: '#1E293B', borderColor: '#334155' }}
                  onMouseEnter={() => setHoveredActivity(activity.id)}
                  onMouseLeave={() => setHoveredActivity(null)}
                >
                  {/* Main row */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/[0.03]"
                    onClick={() => setExpandedActivity(isExpanded ? null : activity.id)}
                  >
                    {/* Type icon with colored dot */}
                    <div className="relative shrink-0">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: color + '18' }}
                      >
                        <Icon size={16} style={{ color }} />
                      </div>
                      <div
                        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                        style={{ backgroundColor: color, borderColor: '#1E293B' }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold truncate" style={{ color: '#E2E8F0' }}>
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
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs" style={{ color }}>
                          {getActivityTypeLabel(activity.type)}
                        </span>
                        <span style={{ color: '#334155' }}>·</span>
                        <span className="text-xs flex items-center gap-1" style={{ color: '#64748B' }}>
                          <Clock size={10} />
                          {relativeTime(activity.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Hover actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <AnimatePresence>
                        {hoveredActivity === activity.id && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteActivity(activity.id);
                            }}
                            className="p-1.5 rounded-md cursor-pointer transition-colors"
                            style={{ color: '#EF4444' }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EF444418')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        )}
                      </AnimatePresence>

                      {/* Expand chevron */}
                      {activity.content && (
                        isExpanded ? (
                          <ChevronUp size={16} style={{ color: '#64748B' }} />
                        ) : (
                          <ChevronDown size={16} style={{ color: '#64748B' }} />
                        )
                      )}
                    </div>
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && activity.content && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-4 pb-3 pt-1 text-sm leading-relaxed"
                          style={{
                            color: '#94A3B8',
                            borderTop: '1px solid #334155',
                            marginRight: 48,
                          }}
                        >
                          {activity.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <Activity size={48} style={{ color: '#64748B' }} strokeWidth={1.5} />
          <p className="mt-4 text-sm" style={{ color: '#94A3B8' }}>
            {activities.length === 0
              ? 'אין פעילויות עדיין.'
              : 'אין תוצאות לפי הסינון הנוכחי.'}
          </p>
        </div>
      )}
    </div>
  );
}
