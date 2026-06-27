import { cp, mkdir, readFile, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'www');
const packageSizeBudgetMegabytes = 120;

const runtimeDirectories = new Set(['locales', 'media', 'thumbs']);
const referenceScanDirectories = new Set(['locales']);
const rootRuntimeExtensions = new Set([
  '.css',
  '.gif',
  '.html',
  '.ico',
  '.jpeg',
  '.jpg',
  '.js',
  '.mp3',
  '.png',
  '.svg',
  '.ttf',
  '.wav',
  '.webp',
  '.woff',
  '.woff2'
]);
const referenceScanExtensions = new Set(['.css', '.html', '.js', '.json']);

const excludedNames = new Set([
  '.DS_Store',
  'Thumbs.db',
  'capacitor.config.json',
  'package-lock.json',
  'package.json'
]);

const excludedRuntimePaths = new Set([
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
  'media/tumski/sunset/sunset3.png',
  'media/watercolor/22.png',
  'music.mp3'
]);

const excludedExtensions = new Set([
  '.bak',
  '.backup',
  '.log',
  '.md',
  '.new',
  '.psd',
  '.textClipping',
  '.xlsx',
  '.zip'
]);

function toRuntimePath(filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join('/');
}

function shouldSkipFile(filePath) {
  const baseName = path.basename(filePath);
  const ext = path.extname(filePath);

  return (
    excludedNames.has(baseName) ||
    excludedRuntimePaths.has(toRuntimePath(filePath)) ||
    excludedExtensions.has(ext) ||
    baseName.startsWith('._') ||
    baseName.startsWith('~$') ||
    baseName.includes(' copy.')
  );
}

async function collectReferenceScanFiles() {
  const files = [];

  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });

    await Promise.all(entries.map(async (entry) => {
      const current = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(current);
        return;
      }

      if (
        entry.isFile() &&
        !shouldSkipFile(current) &&
        referenceScanExtensions.has(path.extname(entry.name))
      ) {
        files.push(current);
      }
    }));
  }

  const entries = await readdir(rootDir, { withFileTypes: true });

  await Promise.all(entries.map(async (entry) => {
    const current = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      if (referenceScanDirectories.has(entry.name)) {
        await walk(current);
      }
      return;
    }

    if (
      entry.isFile() &&
      !shouldSkipFile(current) &&
      referenceScanExtensions.has(path.extname(entry.name))
    ) {
      files.push(current);
    }
  }));

  return files;
}

async function assertExcludedRuntimePathsUnreferenced() {
  const files = await collectReferenceScanFiles();
  const references = [];

  await Promise.all(files.map(async (file) => {
    const content = await readFile(file, 'utf8');

    excludedRuntimePaths.forEach((excludedPath) => {
      if (content.includes(excludedPath)) {
        references.push(`${toRuntimePath(file)} -> ${excludedPath}`);
      }
    });
  }));

  if (references.length > 0) {
    throw new Error([
      'Build exclusion reference check failed:',
      ...references.map((reference) => `  - ${reference}`)
    ].join('\n'));
  }
}

async function copyDirectory(src, dest) {
  await cp(src, dest, {
    recursive: true,
    filter: (source) => !shouldSkipFile(source)
  });
}

async function copyRootRuntimeFiles() {
  const entries = await readdir(rootDir, { withFileTypes: true });

  await Promise.all(entries.map(async (entry) => {
    const src = path.join(rootDir, entry.name);
    const dest = path.join(outDir, entry.name);

    if (entry.isDirectory()) {
      if (runtimeDirectories.has(entry.name)) {
        await copyDirectory(src, dest);
      }
      return;
    }

    if (!entry.isFile() || shouldSkipFile(src)) {
      return;
    }

    if (rootRuntimeExtensions.has(path.extname(entry.name))) {
      await cp(src, dest);
    }
  }));
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

async function summarizeBuild() {
  let fileCount = 0;
  let totalBytes = 0;

  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });

    await Promise.all(entries.map(async (entry) => {
      const current = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(current);
        return;
      }

      if (entry.isFile()) {
        const info = await stat(current);
        fileCount += 1;
        totalBytes += info.size;
      }
    }));
  }

  await walk(outDir);

  const totalMegabytes = formatMegabytes(totalBytes);
  console.log(`Built Capacitor web assets: ${fileCount} files, ${totalMegabytes} MB -> www/`);

  return { fileCount, totalBytes };
}

await assertExcludedRuntimePathsUnreferenced();
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await copyRootRuntimeFiles();
assertPackageBudget(await summarizeBuild());
