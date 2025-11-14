const fs = require('fs');
const code = fs.readFileSync('FE/src/pages/Premium.tsx','utf8');
const start = code.indexOf('readOnly');
for (let i = start; i < start + 40; i++) {
  const ch = code[i];
  console.log(i - start, ch === '\r' ? '\\r' : ch === '\n' ? '\\n' : ch);
}
