const fs = require('fs');
const content = fs.readFileSync('src/data/lessons.ts', 'utf8');
const lines = content.split('\n');
console.log('num-1 line:', lines.findIndex(l => l.includes("'num-1'")));
console.log('num-20 line:', lines.findIndex(l => l.includes("'num-20'")));
console.log('num-21 line:', lines.findIndex(l => l.includes("'num-21'")));
console.log('num-100 line:', lines.findIndex(l => l.includes("'num-100'")));
