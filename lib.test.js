import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emi, schedule, compare, toCSV } from './lib.js';

test('emi matches the standard formula', () => {
  // 10,00,000 at 8.5% for 20 years = 8678.23 (published bank value)
  assert.equal(Math.round(emi(1000000, 8.5, 240) * 100) / 100, 8678.23);
});

test('emi with zero interest divides evenly', () => {
  assert.equal(emi(1200, 0, 12), 100);
});

test('schedule without prepayment closes the loan in exactly n months', () => {
  const s = schedule({ principal: 500000, rate: 9, months: 60 });
  assert.equal(s.rows.length, 60);
  assert.ok(s.rows.at(-1).balance < 0.01);
  const paidPrincipal = s.rows.reduce((a, r) => a + r.principal, 0);
  assert.ok(Math.abs(paidPrincipal - 500000) < 0.01);
});

test('monthly extra payment shortens tenure and saves interest', () => {
  const c = compare({ principal: 3000000, rate: 8.75, months: 240, extraMonthly: 5000 });
  assert.ok(c.monthsSaved > 0);
  assert.ok(c.interestSaved > 0);
  assert.equal(c.base.rows.length - c.plan.rows.length, c.monthsSaved);
});

test('lump sum in a given month reduces balance that month', () => {
  const s = schedule({ principal: 100000, rate: 12, months: 12, lumps: [{ month: 3, amount: 20000 }] });
  assert.equal(s.rows[2].extra, 20000);
  assert.ok(s.rows.length < 12);
});

test('extra payment never overshoots the remaining balance', () => {
  const s = schedule({ principal: 10000, rate: 10, months: 12, lumps: [{ month: 1, amount: 999999 }] });
  assert.equal(s.rows.length, 1);
  assert.ok(Math.abs(s.rows[0].balance) < 1e-9);
  assert.ok(s.totalPaid < 10100);
});

test('csv has a header and one line per month', () => {
  const s = schedule({ principal: 12000, rate: 0, months: 12 });
  const lines = toCSV(s).trim().split('\n');
  assert.equal(lines.length, 13);
  assert.match(lines[0], /^Month,EMI,Principal,Interest,Extra,Balance$/);
});

test('rejects nonsense input', () => {
  assert.throws(() => schedule({ principal: -5, rate: 5, months: 10 }));
  assert.throws(() => schedule({ principal: 1000, rate: 5, months: 0 }));
});
