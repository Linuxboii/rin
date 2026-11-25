# Rin

Loan EMI and prepayment calculator.

**Live:** https://rin.avlokai.com

**For:** Anyone paying off a home, car, education or personal loan who wants to know whether prepaying is worth it.

## What it does

- Monthly EMI from amount, rate and tenure
- Extra monthly payments and one-time lump sums in any month
- Interest saved and how much earlier the loan closes
- Full month-by-month schedule, downloadable as CSV
- 20 currencies, defaults to yours

Prepayments reduce the tenure and keep the EMI fixed, which is how most lenders apply part-payments by default.

## Demand

Semrush estimates emicalculator.net, one EMI calculator site, at about 1.1 million visits in a month.

- [Semrush: emicalculator.net](https://tr.semrush.com/website/emicalculator.net/overview)

These figures measure demand for the task, from existing tools. They are third-party estimates or company claims, not usage of this tool.

## Privacy

Everything runs in your browser. There is no backend, no analytics and no account. Nothing you enter is uploaded.

## Run locally

No build step and no runtime dependencies. Serve the folder with any static server:

```
npx serve .
```

## Tests

The logic lives in `lib.js` as pure functions, tested with the Node test runner (Node 20+):

```
npm test
```

## Files

- `index.html` page and styles
- `app.js` wiring between the page and the logic
- `lib.js` pure logic, no DOM
- `lib.test.js` tests
- `base.css`, `ui.js` shared look and small DOM helpers

## Licence

MIT. Made by [Sushanth Kasturi](https://sushanth.avlokai.com).
