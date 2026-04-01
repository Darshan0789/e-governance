/**
 * Renders docs/SRS-Seva-Portal.md to docs/SRS-Seva-Portal.pdf using pdfkit (no Chromium).
 * Run: node scripts/md-to-pdf-pdfkit.mjs
 */
import PDFDocument from 'pdfkit';
import { createWriteStream, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const mdPath = join(root, 'docs', 'SRS-Seva-Portal.md');
const pdfPath = join(root, 'docs', 'SRS-Seva-Portal.pdf');

if (!existsSync(mdPath)) {
  console.error('Missing', mdPath, '— run: node scripts/generate-srs.mjs');
  process.exit(1);
}

let text = readFileSync(mdPath, 'utf8');
// Light cleanup for PDF readability (keep structure)
text = text.replace(/\r\n/g, '\n');

const doc = new PDFDocument({
  margin: 54,
  size: 'A4',
  bufferPages: true,
  info: {
    Title: 'SRS — Seva Portal (E-Governance)',
    Author: 'Seva Portal Project',
    Subject: 'Software Requirements Specification',
  },
});

const stream = createWriteStream(pdfPath);
doc.pipe(stream);

doc.font('Times-Roman').fontSize(10);
doc.text(text, {
  width: doc.page.width - 108,
  align: 'left',
  lineGap: 2,
});

doc.end();

stream.on('finish', () => {
  console.log('PDF written:', pdfPath);
});
