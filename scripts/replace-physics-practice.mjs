import fs from 'node:fs';
import path from 'node:path';

const mapping = [
  { src: 'Chapter 1 - Lesson 1.pdf', dest: 'ph-c1-l1-practice.pdf' },
  { src: 'Chapter 1 - Lesson 2.pdf', dest: 'ph-c1-l2-practice.pdf' },
  { src: 'Chapter 1 - Lesson 3.pdf', dest: 'ph-c1-l3-practice.pdf' },
  { src: 'Chapter 1 - Lesson 4.pdf', dest: 'ph-c1-l4-practice.pdf' },
  { src: 'Chapter 2 - Lesson 1.pdf', dest: 'ph-c2-l1-practice.pdf' },
  { src: 'Chapter 2 - Lesson 2.pdf', dest: 'ph-c2-l2-practice.pdf' },
  { src: 'Chapter 2 - Lesson 3.pdf', dest: 'ph-c2-l3-practice.pdf' },
  { src: 'Chapter 2 - Lesson 4.pdf', dest: 'ph-c2-l4-practice.pdf' },
  { src: 'Chapter 3 - Lesson 1.pdf', dest: 'ph-c3-l1-practice.pdf' },
  { src: 'Chapter 3 - Lesson 2.pdf', dest: 'ph-c3-l2-practice.pdf' },
  { src: 'Chapter 3 - Lesson 3.pdf', dest: 'ph-c3-l3-practice.pdf' },
  { src: 'Chapter 3 - Lesson 4.pdf', dest: 'ph-c3-l4-practice.pdf' },
  { src: 'Chapter 4 - Lesson 1.pdf', dest: 'ph-c4-l1-practice.pdf' },
  { src: 'Chapter 4 - Lesson 2.pdf', dest: 'ph-c4-l2-practice.pdf' },
  { src: 'Chapter 4 - Lesson 3.pdf', dest: 'ph-c4-l3-practice.pdf' },
  { src: 'Chapter 5 - Lesson 1.pdf', dest: 'ph-c5-l1-practice.pdf' },
  { src: 'Chapter 5 - Lesson 2.pdf', dest: 'ph-c5-l2-practice.pdf' },
  { src: 'Chapter 6.pdf',            dest: 'ph-c6-l1-practice.pdf' },
  { src: 'Chapter 7.pdf',            dest: 'ph-c7-l1-practice.pdf' },
  { src: 'Chapter 8 - Lesson 1.pdf', dest: 'ph-c8-l1-practice.pdf' },
  { src: 'Chapter 8 - Lesson 2.pdf', dest: 'ph-c8-l2-practice.pdf' },
];

const sourceDir = path.resolve('E:/IBM Build Skills/El Mo3adla/Physics/practice');
const targetDirs = [
  path.resolve('E:/IBM Build Skills/cs-equivalency-react-project/cs-equivalency/public/pdfs/physics'),
  path.resolve('E:/IBM Build Skills/pdfs/physics'),
  path.resolve('E:/IBM Build Skills/cs-equivalency-site-ready/pdfs/physics'),
].filter(d => fs.existsSync(d));

console.log(`Source directory: ${sourceDir}`);
console.log(`Target directories (${targetDirs.length}):`);
targetDirs.forEach(d => console.log(` - ${d}`));

console.log('\nStarting replacement of physics practice PDFs...\n');

let totalCopied = 0;
let errors = 0;

for (const item of mapping) {
  const srcPath = path.join(sourceDir, item.src);
  if (!fs.existsSync(srcPath)) {
    console.error(`[ERROR] Missing source file: ${srcPath}`);
    errors++;
    continue;
  }

  const srcStat = fs.statSync(srcPath);

  for (const tDir of targetDirs) {
    const destPath = path.join(tDir, item.dest);
    const prevSize = fs.existsSync(destPath) ? fs.statSync(destPath).size : 0;
    fs.copyFileSync(srcPath, destPath);
    const newStat = fs.statSync(destPath);
    if (newStat.size !== srcStat.size) {
      console.error(`[ERROR] Size mismatch for ${destPath}: got ${newStat.size}, expected ${srcStat.size}`);
      errors++;
    } else {
      console.log(`✓ Copied: ${item.src} -> ${path.basename(tDir)}/${item.dest} (${(prevSize / 1024 / 1024).toFixed(2)} MB -> ${(newStat.size / 1024 / 1024).toFixed(2)} MB)`);
      totalCopied++;
    }
  }
}

console.log(`\nReplacement complete! Total copied: ${totalCopied}, Errors: ${errors}`);
if (errors > 0) {
  process.exit(1);
}
