import { compare, toCSV } from './lib.js';
import { $, download } from './ui.js';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED', 'JPY', 'CNY', 'BRL', 'ZAR', 'NGN', 'PKR', 'BDT', 'LKR', 'NPR', 'IDR', 'PHP', 'MYR'];
const guess = () => {
  const lang = navigator.language || 'en-US';
  const map = { IN: 'INR', US: 'USD', GB: 'GBP', AU: 'AUD', CA: 'CAD', SG: 'SGD', AE: 'AED', JP: 'JPY', CN: 'CNY', BR: 'BRL', ZA: 'ZAR', NG: 'NGN', PK: 'PKR', BD: 'BDT', LK: 'LKR', NP: 'NPR', ID: 'IDR', PH: 'PHP', MY: 'MYR' };
  const region = lang.split('-')[1];
  return map[region] || (/^(de|fr|es|it|nl|pt|fi|el)/.test(lang) ? 'EUR' : 'USD');
};

const cur = $('#currency');
for (const c of CURRENCIES) cur.append(new Option(c, c));
cur.value = guess();

let last = null;
const money = (n) =>
  new Intl.NumberFormat(cur.value === 'INR' ? 'en-IN' : undefined, { style: 'currency', currency: cur.value, maximumFractionDigits: 0 }).format(n);
const dur = (m) => {
  const y = Math.floor(m / 12), r = m % 12;
  return [y && `${y} yr`, r && `${r} mo`].filter(Boolean).join(' ') || '0 mo';
};

function addLump(month = '', amount = '') {
  const row = document.createElement('div');
  row.className = 'lump';
  row.innerHTML = `
    <input type="number" min="1" placeholder="Month no." aria-label="Month number" value="${month}">
    <input type="number" min="0" placeholder="Amount" aria-label="Lump sum amount" value="${amount}">
    <button type="button" class="ghost" aria-label="Remove lump sum">Remove</button>`;
  row.querySelector('button').onclick = () => { row.remove(); run(); };
  $('#lumps').append(row);
}

function read() {
  const num = (id) => parseFloat($(id).value);
  const lumps = [...document.querySelectorAll('.lump')].map((r) => {
    const [m, a] = r.querySelectorAll('input');
    return { month: parseInt(m.value, 10), amount: parseFloat(a.value) };
  }).filter((l) => l.month > 0 && l.amount > 0);
  return { principal: num('#principal'), rate: num('#rate'), months: Math.round(num('#years') * 12), extraMonthly: num('#extra') || 0, lumps };
}

function run() {
  const err = $('#err');
  let c;
  try {
    c = compare(read());
    err.textContent = '';
  } catch {
    err.textContent = 'Enter an amount, a rate of zero or more, and a tenure of at least half a year.';
    return;
  }
  last = c;
  $('#emi').textContent = money(c.base.emi);
  $('#interest').textContent = money(c.base.totalInterest);
  $('#saved').textContent = money(c.interestSaved);
  $('#months').textContent = dur(c.monthsSaved);
  $('#summary').textContent = c.monthsSaved > 0
    ? `With prepayments the loan closes in ${dur(c.plan.rows.length)} instead of ${dur(c.base.rows.length)}. Total paid: ${money(c.plan.totalPaid)}.`
    : `Total paid over ${dur(c.base.rows.length)}: ${money(c.base.totalPaid)}. Add an extra payment to see the savings.`;
  const body = $('#rows');
  body.replaceChildren(...c.plan.rows.map((r) => {
    const tr = document.createElement('tr');
    for (const v of [r.month, money(r.principal), money(r.interest), r.extra ? money(r.extra) : '-', money(r.balance)]) {
      const td = document.createElement('td');
      td.textContent = v;
      tr.append(td);
    }
    return tr;
  }));
}

$('#addLump').onclick = () => { addLump(); };
$('#form').addEventListener('input', run);
cur.addEventListener('change', run);
$('#csv').onclick = () => last && download(toCSV(last.plan), 'loan-schedule.csv', 'text/csv');
addLump(12, 100000);
run();
