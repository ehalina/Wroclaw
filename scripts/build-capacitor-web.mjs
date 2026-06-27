import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webRootDir = path.join(rootDir, 'www');
const packageSizeBudgetMegabytes = 120;

const referenceScanExtensions = new Set(['.css', '.html', '.js', '.json']);
const forbiddenRuntimePaths = new Set([
  'Gemini_Generated_Image_5x2pd05x2pd05x2p.png',
  'media/Wroclaw_Saver.png',
  'media/book/Gemini_Generated_Image_5x2pd05x2pd05x2p.png',
  'media/krasnolud/Gemini_Generated_Image_1q2txm1q2txm1q2t.png',
  'media/krasnolud/Gemini_Generated_Image_1v0m2q1v0m2q1v0m.png',
  'media/krasnolud/Gemini_Generated_Image_1v8dfm1v8dfm1v8d.png',
  'media/krasnolud/Gemini_Generated_Image_7lker47lker47lke.png',
  'media/krasnolud/Gemini_Generated_Image_axo74iaxo74iaxo7.png',
  'media/krasnolud/Gemini_Generated_Image_v3t5jnv3t5jnv3t5.png',
  'media/krasnolud/Gemini_Generated_Image_vtmv4vvtmv4vvtmv.png',
  'media/krasnolud/Gemini_Generated_Image_xal0grxal0grxal0.png',
  'media/krasnolud/Снимок экрана 2026-01-25 в 18.04.04.png',
  'media/krasnolud/u7173139994_Bronze_gnome_figurine_same_perspective_do_not_chang_42cebd36-ece2-491f-91b2-67f0cc47d8aa.png',
  'media/krasnolud/u7173139994_Bronze_gnome_figurine_same_perspective_do_not_chang_f574f9f5-15cb-4d89-857e-e46a0ac1ac3d.png',
  'media/tumski/sunset/sunset1.png',
  'media/tumski/sunset/sunset2.png',
  'media/tumski/sunset/sunset3.png',
  'media/zwyki/opening-a-book.wav',
  'media/zwyki/step.wav',
  'media/watercolor/22.png',
  'music.mp3'
]);

function toWebPath(filePath) {
  return path.relative(webRootDir, filePath).split(path.sep).join('/');
}

function shouldSkipFile(filePath) {
  const baseName = path.basename(filePath);
  return (
    baseName === '.DS_Store' ||
    baseName === 'Thumbs.db' ||
    baseName.startsWith('._') ||
    baseName.startsWith('~$') ||
    baseName.includes(' copy.')
  );
}

async function collectFiles(dir, predicate) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  await Promise.all(entries.map(async (entry) => {
    const current = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(current, predicate));
      return;
    }

    if (entry.isFile() && !shouldSkipFile(current) && predicate(current)) {
      files.push(current);
    }
  }));

  return files;
}

async function assertForbiddenRuntimePathsAbsent() {
  const present = [];

  await Promise.all([...forbiddenRuntimePaths].map(async (runtimePath) => {
    try {
      await stat(path.join(webRootDir, runtimePath));
      present.push(runtimePath);
    } catch (_) {
      // Not present in the Capacitor web source, as expected.
    }
  }));

  if (present.length > 0) {
    throw new Error([
      'Capacitor web source contains forbidden non-runtime assets:',
      ...present.map((runtimePath) => `  - ${runtimePath}`)
    ].join('\n'));
  }
}

async function assertForbiddenRuntimePathsUnreferenced() {
  const files = await collectFiles(
    webRootDir,
    (file) => referenceScanExtensions.has(path.extname(file))
  );
  const references = [];

  await Promise.all(files.map(async (file) => {
    const content = await readFile(file, 'utf8');

    forbiddenRuntimePaths.forEach((forbiddenPath) => {
      if (content.includes(forbiddenPath)) {
        references.push(`${toWebPath(file)} -> ${forbiddenPath}`);
      }
    });
  }));

  if (references.length > 0) {
    throw new Error([
      'Capacitor web source forbidden reference check failed:',
      ...references.map((reference) => `  - ${reference}`)
    ].join('\n'));
  }
}

function formatMegabytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(1);
}

function assertPackageBudget({ totalBytes }) {
  const budgetBytes = packageSizeBudgetMegabytes * 1024 * 1024;

  if (totalBytes > budgetBytes) {
    throw new Error(
      `Capacitor web package exceeds budget: ${formatMegabytes(totalBytes)} MB > ${packageSizeBudgetMegabytes} MB`
    );
  }
}

async function summarizeWebSource() {
  const files = await collectFiles(webRootDir, () => true);
  let totalBytes = 0;

  await Promise.all(files.map(async (file) => {
    const info = await stat(file);
    totalBytes += info.size;
  }));

  const totalMegabytes = formatMegabytes(totalBytes);
  console.log(`Validated Capacitor web source: ${files.length} files, ${totalMegabytes} MB in www/`);

  return { fileCount: files.length, totalBytes };
}

await assertForbiddenRuntimePathsAbsent();
await assertForbiddenRuntimePathsUnreferenced();
assertPackageBudget(await summarizeWebSource());
