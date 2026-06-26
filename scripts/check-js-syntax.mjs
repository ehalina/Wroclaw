import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ignoredDirectories = new Set([
  '.git',
  'android',
  'docs',
  'Init',
  'ios',
  'node_modules',
  'www',
  '__BestPractice'
]);

function shouldSkipFile(filePath) {
  const baseName = path.basename(filePath);
  return (
    baseName.endsWith('.backup') ||
    baseName.endsWith('.new') ||
    baseName.includes(' copy.')
  );
}

async function collectJavaScriptFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const current = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...await collectJavaScriptFiles(current));
      }
      continue;
    }

    if (!entry.isFile() || shouldSkipFile(current)) {
      continue;
    }

    if (current.endsWith('.js') || current.endsWith('.mjs')) {
      files.push(current);
    }
  }

  return files;
}

const files = await collectJavaScriptFiles(rootDir);
const failures = [];

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    cwd: rootDir,
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    failures.push({
      file: path.relative(rootDir, file),
      output: `${result.stdout}${result.stderr}`.trim()
    });
  }
}

if (failures.length > 0) {
  console.error('JS syntax check failed:');
  for (const failure of failures) {
    console.error(`\n${failure.file}`);
    console.error(failure.output);
  }
  process.exit(1);
}

console.log(`JS syntax check passed (${files.length} files).`);

