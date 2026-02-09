import useStore from '../../store/useStore';

export default function MortgageBar() {
  const mortgageYears = useStore((s) => s.mortgageYears);
  const mortgageRate = useStore((s) => s.mortgageRate);
  const setMortgageYears = useStore((s) => s.setMortgageYears);
  const setMortgageRate = useStore((s) => s.setMortgageRate);

  return (
    <div
      className="sticky z-40 flex items-center gap-4 px-4"
      style={{
        top: 56,
        height: 40,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid #334155',
      }}
    >
      {/* Years slider */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <label
          className="text-xs whitespace-nowrap flex-shrink-0"
          style={{ color: '#94A3B8' }}
        >
          שנים
        </label>
        <input
          type="range"
          min={15}
          max={30}
          step={1}
          value={mortgageYears}
          onChange={(e) => setMortgageYears(Number(e.target.value))}
          className="flex-1 h-1 appearance-none rounded-full cursor-pointer"
          style={{
            accentColor: '#3B82F6',
            background: `linear-gradient(to left, #3B82F6 ${((mortgageYears - 15) / 15) * 100}%, #334155 ${((mortgageYears - 15) / 15) * 100}%)`,
          }}
        />
        <span
          className="text-xs font-mono font-semibold w-6 text-center flex-shrink-0"
          style={{ color: '#E2E8F0' }}
        >
          {mortgageYears}
        </span>
      </div>

      {/* Divider */}
      <div
        className="h-4 w-px flex-shrink-0"
        style={{ backgroundColor: '#334155' }}
      />

      {/* Rate slider */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <label
          className="text-xs whitespace-nowrap flex-shrink-0"
          style={{ color: '#94A3B8' }}
        >
          ריבית %
        </label>
        <input
          type="range"
          min={3.0}
          max={6.5}
          step={0.1}
          value={mortgageRate}
          onChange={(e) => setMortgageRate(Number(e.target.value))}
          className="flex-1 h-1 appearance-none rounded-full cursor-pointer"
          style={{
            accentColor: '#F59E0B',
            background: `linear-gradient(to left, #F59E0B ${((mortgageRate - 3.0) / 3.5) * 100}%, #334155 ${((mortgageRate - 3.0) / 3.5) * 100}%)`,
          }}
        />
        <span
          className="text-xs font-mono font-semibold w-8 text-center flex-shrink-0"
          style={{ color: '#E2E8F0' }}
        >
          {mortgageRate.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
