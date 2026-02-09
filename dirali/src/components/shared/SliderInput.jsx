import { useId } from 'react';

export default function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  color = '#3B82F6',
  disabled = false,
}) {
  const id = useId();

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full" dir="rtl">
      {/* Label row */}
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={id}
          className="text-sm font-medium"
          style={{ color: '#E2E8F0' }}
        >
          {label}
        </label>
        <span
          className="text-sm font-mono font-semibold"
          style={{ color }}
        >
          {value.toLocaleString('he-IL')}{unit && ` ${unit}`}
        </span>
      </div>

      {/* Range input */}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: `linear-gradient(to left, ${color} ${percentage}%, #334155 ${percentage}%)`,
          accentColor: color,
        }}
      />

      {/* Min/Max labels */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs" style={{ color: '#64748B' }}>
          {min.toLocaleString('he-IL')}{unit && ` ${unit}`}
        </span>
        <span className="text-xs" style={{ color: '#64748B' }}>
          {max.toLocaleString('he-IL')}{unit && ` ${unit}`}
        </span>
      </div>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid #0F172A;
          cursor: pointer;
          box-shadow: 0 0 0 3px ${color}33;
        }
        input[type='range']::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid #0F172A;
          cursor: pointer;
          box-shadow: 0 0 0 3px ${color}33;
        }
        input[type='range']:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
        }
        input[type='range']:disabled::-moz-range-thumb {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
