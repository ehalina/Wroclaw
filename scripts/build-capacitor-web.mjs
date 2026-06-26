import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'www');

const runtimeDirectories = new Set(['locales', 'media', 'thumbs']);
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

const excludedNames = new Set([
  '.DS_Store',
  'Thumbs.db',
  'capacitor.config.json',
  'package-lock.json',
  'package.json'
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

function shouldSkipFile(filePath) {
  const baseName = path.basename(filePath);
  const ext = path.extname(filePath);

  return (
    excludedNames.has(baseName) ||
    excludedExtensions.has(ext) ||
    baseName.startsWith('._') ||
    baseName.startsWith('~$') ||
    baseName.includes(' copy.')
  );
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

  const totalMegabytes = (totalBytes / 1024 / 1024).toFixed(1);
  console.log(`Built Capacitor web assets: ${fileCount} files, ${totalMegabytes} MB -> www/`);
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await copyRootRuntimeFiles();
await summarizeBuild();
