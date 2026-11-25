// Loan math. Pure functions, no DOM.

/** Monthly instalment for principal p, annual rate r (%), n months. */
export function emi(p, r, n) {
  const i = r / 1200;
  if (i === 0) return p / n;
  const f = (1 + i) ** n;
  return (p * i * f) / (f - 1);
}

/**
 * Month-by-month schedule. Prepayments reduce tenure; the EMI stays fixed,
 * which is how most lenders apply part-payments by default.
 */
export function schedule({ principal, rate, months, extraMonthly = 0, lumps = [] }) {
  if (!(principal > 0) || !(months >= 1) || !(rate >= 0) || !Number.isFinite(principal)) {
    throw new RangeError('Principal and tenure must be positive, rate zero or more.');
  }
  months = Math.round(months);
  const i = rate / 1200;
  const pay = emi(principal, rate, months);
  const lumpAt = new Map();
  for (const l of lumps) if (l.amount > 0) lumpAt.set(l.month, (lumpAt.get(l.month) || 0) + l.amount);

  const rows = [];
  let bal = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  for (let m = 1; bal > 1e-6 && m <= months; m++) {
    const interest = bal * i;
    let princ = Math.min(pay - interest, bal);
    bal -= princ;
    let extra = Math.min(extraMonthly + (lumpAt.get(m) || 0), bal);
    bal -= extra;
    if (bal < 1e-6) bal = 0;
    totalInterest += interest;
    totalPaid += princ + interest + extra;
    rows.push({ month: m, emi: princ + interest, principal: princ, interest, extra, balance: bal });
  }
  return { emi: pay, rows, totalInterest, totalPaid };
}

/** Baseline vs plan with prepayments. */
export function compare(opts) {
  const base = schedule({ principal: opts.principal, rate: opts.rate, months: opts.months });
  const plan = schedule(opts);
  return {
    base,
    plan,
    monthsSaved: base.rows.length - plan.rows.length,
    interestSaved: base.totalInterest - plan.totalInterest,
  };
}

export function toCSV(s) {
  const f = (x) => x.toFixed(2);
  const lines = ['Month,EMI,Principal,Interest,Extra,Balance'];
  for (const r of s.rows) lines.push([r.month, f(r.emi), f(r.principal), f(r.interest), f(r.extra), f(r.balance)].join(','));
  return lines.join('\n') + '\n';
}
