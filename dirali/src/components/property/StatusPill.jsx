import { PIPELINE_STATUSES } from '../../utils/constants';

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
};

export default function StatusPill({ status, onClick, size = 'sm' }) {
  const config = PIPELINE_STATUSES.find((s) => s.id === status);

  if (!config) return null;

  const sizeClass = sizeClasses[size] || sizeClasses.sm;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap transition-colors ${sizeClass} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{
        backgroundColor: `${config.color}33`,
        color: config.color,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {config.label}
    </span>
  );
}
