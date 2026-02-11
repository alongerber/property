/**
 * Israeli purchase tax (mas rechisha) 2026.
 * @param {number} price - Property price in ILS
 * @param {boolean} isFirstProperty - true = sole property, false = additional property (8%/10%)
 */
export function calcTax(price, isFirstProperty = true) {
  if (!price || price <= 0) return 0;

  if (isFirstProperty) {
    // First / sole property brackets (2026)
    let tax = 0;
    if (price > 1978745) tax += Math.min(price, 2347040) - 1978745;
    tax *= 0.035;
    if (price > 2347040) tax += (Math.min(price, 6055070) - 2347040) * 0.05;
    if (price > 6055070) tax += (Math.min(price, 20000000) - 6055070) * 0.08;
    if (price > 20000000) tax += (price - 20000000) * 0.10;
    return Math.round(tax);
  }

  // Additional property (investment / second home)
  let tax = 0;
  tax += Math.min(price, 6055070) * 0.08;
  if (price > 6055070) tax += (price - 6055070) * 0.10;
  return Math.round(tax);
}

export function calcMortgage(principal, annualRate, years) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num) {
  return new Intl.NumberFormat('he-IL').format(num);
}

export function getDaysUntilDeadline() {
  const deadline = new Date('2026-04-01');
  const now = new Date();
  return Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
}

export function getIncomeRatio(monthlyPayment, income) {
  return (monthlyPayment / income) * 100;
}

export function getIncomeRatioColor(ratio) {
  if (ratio < 28) return '#10B981';
  if (ratio <= 35) return '#F59E0B';
  return '#EF4444';
}

export function generateAmortizationSchedule(principal, annualRate, years) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  const monthlyPayment = calcMortgage(principal, annualRate, years);
  const schedule = [];
  let balance = principal;

  for (let year = 1; year <= years; year++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    const opening = balance;

    for (let m = 0; m < 12; m++) {
      const interest = balance * r;
      const principalPart = monthlyPayment - interest;
      yearInterest += interest;
      yearPrincipal += principalPart;
      balance -= principalPart;
    }

    schedule.push({
      year,
      opening: Math.round(opening),
      payment: Math.round(monthlyPayment * 12),
      principal: Math.round(yearPrincipal),
      interest: Math.round(yearInterest),
      closing: Math.max(0, Math.round(balance)),
    });
  }

  return schedule;
}

export function relativeTime(date) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'עכשיו';
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
  return d.toLocaleDateString('he-IL');
}
