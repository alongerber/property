import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/calculations';
import { PIPELINE_STATUSES } from '../../utils/constants';

function getDaysInStatus(statusUpdatedAt) {
  if (!statusUpdatedAt) return 0;
  const updated = new Date(statusUpdatedAt);
  const now = new Date();
  return Math.floor((now - updated) / (1000 * 60 * 60 * 24));
}

export default function PropertyCard({ property, onClick }) {
  const {
    name,
    price,
    color = '#3B82F6',
    images = [],
    rooms,
    sqm,
    garden_sqm,
    status,
    status_updated_at,
  } = property;

  const primaryImage = images?.[0];
  const daysInStatus = getDaysInStatus(status_updated_at);
  const statusConfig = PIPELINE_STATUSES.find((s) => s.id === status);

  return (
    <motion.div
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{
        backgroundColor: '#1E293B',
        border: `1px solid ${color}33`,
      }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      dir="rtl"
    >
      {/* Image / Fallback */}
      <div className="relative h-32 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: `${color}22` }}
          >
            <span
              className="text-4xl font-bold opacity-60"
              style={{ color }}
            >
              {name?.charAt(0) || '?'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Name */}
        <h4
          className="text-sm font-bold truncate mb-1"
          style={{ color: '#E2E8F0' }}
        >
          {name}
        </h4>

        {/* Price */}
        <p
          className="text-base font-mono font-semibold mb-2"
          style={{ color }}
        >
          {formatCurrency(price)}
        </p>

        {/* Quick stats */}
        <div
          className="flex items-center gap-2 text-xs mb-3"
          style={{ color: '#94A3B8' }}
        >
          {rooms != null && <span>{rooms} \u05D7\u05D3\u05E8\u05D9\u05DD</span>}
          {rooms != null && sqm != null && <span style={{ color: '#475569' }}>|</span>}
          {sqm != null && <span>{sqm} \u05DE\u0022\u05E8</span>}
          {garden_sqm != null && garden_sqm > 0 && (
            <>
              <span style={{ color: '#475569' }}>|</span>
              <span>{'🌱'} {garden_sqm} {'\u05DE\u0022\u05E8'}</span>
            </>
          )}
        </div>

        {/* Bottom: days in status + status dot */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#64748B' }}>
            {daysInStatus} \u05D9\u05DE\u05D9\u05DD \u05D1\u05E1\u05D8\u05D8\u05D5\u05E1
          </span>
          {statusConfig && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: statusConfig.color }}>
                {statusConfig.label}
              </span>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusConfig.color }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
