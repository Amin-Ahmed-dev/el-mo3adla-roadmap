// Run with: npm run check   (also runs automatically before `npm run build`)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBJECTS_LIST } from '../src/data/subjects/index.js';
import { validateSubjects } from '../src/data/validate.js';

// Bundled links (./pdfs/...) are served from public/, so that is where they must exist.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fileExists = (url) => {
  const rel = decodeURIComponent(url.replace(/^\.?\//, ''));
  return fs.existsSync(path.join(ROOT, 'public', rel));
};

const { errors, warnings, summary } = validateSubjects(SUBJECTS_LIST, { fileExists });

console.log('\nContent check');
for (const s of summary) {
  if (s.status === 'soon') console.log(`  ${s.title.padEnd(12)} coming soon`);
  else console.log(`  ${s.title.padEnd(12)} ${String(s.lessons).padStart(3)} lessons, ${s.linked} of ${s.slots} links filled in`);
}
if (warnings.length) { console.log(`\n${warnings.length} warning(s):`); warnings.forEach((w) => console.log('  - ' + w)); }
if (errors.length) { console.error(`\n${errors.length} error(s):`); errors.forEach((e) => console.error('  x ' + e)); process.exit(1); }
console.log('\nNo errors.\n');
