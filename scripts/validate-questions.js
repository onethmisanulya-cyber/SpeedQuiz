'use strict';
// Validates questions.json without changing game runtime.
// Usage: npm run validate
const fs = require('fs');
const path = require('path');

const ALLOWED_TYPES = new Set(['trivia', 'math', 'unscramble', 'emoji', 'typing']);
const ALLOWED_OPS = new Set(['mul2x1', 'add2', 'sub3x2', 'mul1', 'mixed']);

const file = path.join(__dirname, '..', 'questions.json');
let bank;
try {
  bank = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (e) {
  console.error('FAIL: cannot parse questions.json:', e.message);
  process.exit(1);
}
if (!Array.isArray(bank)) {
  console.error('FAIL: questions.json must be an array');
  process.exit(1);
}

let errors = 0;
const seen = new Set();
const perType = {};
for (let i = 0; i < bank.length; i++) {
  const q = bank[i];
  const where = 'entry #' + i;
  if (q.generated === 'math') {
    if (!ALLOWED_OPS.has(q.op || 'mixed')) {
      console.error(`FAIL ${where}: unknown math op ${JSON.stringify(q.op)}`);
      errors++;
    }
    continue;
  }
  if (!q.type || !ALLOWED_TYPES.has(q.type)) {
    console.error(`FAIL ${where}: bad/missing type ${JSON.stringify(q.type)}`);
    errors++;
  } else {
    perType[q.type] = (perType[q.type] || 0) + 1;
  }
  if (typeof q.prompt !== 'string' || !q.prompt.trim()) {
    console.error(`FAIL ${where}: missing prompt`);
    errors++;
  }
  if (!Array.isArray(q.answers) || q.answers.length === 0 || !q.answers[0]) {
    console.error(`FAIL ${where}: answers[0] must be the canonical answer`);
    errors++;
  }
  const key = (q.prompt || '').trim().toLowerCase();
  if (key) {
    if (seen.has(key)) {
      console.error(`FAIL ${where}: duplicate prompt ${JSON.stringify(q.prompt)}`);
      errors++;
    }
    seen.add(key);
  }
}

for (const t of ALLOWED_TYPES) {
  const n = perType[t] || 0;
  if (n < 12) console.warn(`WARN: type ${t} has only ${n} entries (want >=12 for even mix)`);
}

console.log(`Checked ${bank.length} entries: ${JSON.stringify(perType)}`);
if (errors) {
  console.error(`${errors} error(s)`);
  process.exit(1);
} else {
  console.log('OK: questions.json valid');
}
