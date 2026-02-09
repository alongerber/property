export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" dir="rtl">
      {/* Icon */}
      {Icon && (
        <div className="mb-4">
          <Icon size={56} style={{ color: '#64748B' }} strokeWidth={1.5} />
        </div>
      )}

      {/* Title */}
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: '#E2E8F0' }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className="text-sm max-w-xs leading-relaxed mb-6"
          style={{ color: '#94A3B8' }}
        >
          {description}
        </p>
      )}

      {/* Action button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-xl px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor: '#3B82F6',
            color: '#FFFFFF',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3B82F6')}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
