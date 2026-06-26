import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const knownIssuesPath = path.join(rootDir, 'scripts/static-check-known-issues.json');

const ignoredDirectories = new Set([
  '.git',
  'android',
  'docs',
  'Init',
  'ios',
  'locales',
  'node_modules',
  'playwright-report',
  'test-results',
  'www',
  '__BestPractice'
]);

const scannedExtensions = new Set(['.html', '.css', '.js']);
const routeExtensions = new Set(['.html']);

function normalizeRelative(filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join('/');
}

function shouldSkipFile(filePath) {
  const baseName = path.basename(filePath);
  return (
    baseName.endsWith('.backup') ||
    baseName.endsWith('.new') ||
    baseName.includes(' copy.')
  );
}

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const current = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...await collectFiles(current));
      }
      continue;
    }

    if (!entry.isFile() || shouldSkipFile(current)) {
      continue;
    }

    if (scannedExtensions.has(path.extname(entry.name))) {
      files.push(current);
    }
  }

  return files;
}

function stripComments(text, ext) {
  let stripped = text;

  if (ext === '.html') {
    stripped = stripped.replace(/<!--[\s\S]*?-->/g, '');
  }

  if (ext === '.css' || ext === '.js') {
    stripped = stripped.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  return stripped;
}

function lineForIndex(text, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) {
      line += 1;
    }
  }
  return line;
}

function isExternalReference(value) {
  return /^(?:https?:)?\/\//i.test(value) ||
    /^(?:data|blob|mailto|tel|javascript|about|capacitor):/i.test(value);
}

function normalizeTarget(value) {
  let target = value.trim();

  if (!target || target.startsWith('#') || target.includes('${') || isExternalReference(target)) {
    return null;
  }

  target = target.split('#')[0].split('?')[0].trim();

  if (!target || target.startsWith('#')) {
    return null;
  }

  if (target.startsWith('/')) {
    target = target.slice(1);
  }

  return target;
}

function extractAssetReferences(text, file) {
  const references = [];
  const ext = path.extname(file);
  const stripped = stripComments(text, ext);

  const tagAttrPattern = /<[^>]+\s(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi;
  const jsPropertyPattern = /\b(?!location\b)[A-Za-z_$][\w$]*\.(?:src|href)\s*=\s*["']([^"']+)["']/gi;
  const urlPattern = /(?<![\w$.-])url\(\s*["']?([^"')]+)["']?\s*\)/g;

  for (const pattern of [tagAttrPattern, jsPropertyPattern, urlPattern]) {
    for (const match of stripped.matchAll(pattern)) {
      const target = normalizeTarget(match[1]);
      if (!target) {
        continue;
      }
      references.push({
        file: normalizeRelative(file),
        line: lineForIndex(stripped, match.index || 0),
        target
      });
    }
  }

  return references;
}

function extractRouteReferences(text, file) {
  const references = [];
  const stripped = stripComments(text, path.extname(file));
  const patterns = [
    /\b(?:window\.)?location\.href\s*=\s*["']([^"']+\.html(?:#[^"']*)?)["']/gi,
    /\b(?:navigateToPage|loadPage)\(\s*["']([^"']+\.html(?:#[^"']*)?)["']/gi
  ];

  for (const pattern of patterns) {
    for (const match of stripped.matchAll(pattern)) {
      const target = normalizeTarget(match[1]);
      if (!target) {
        continue;
      }
      references.push({
        file: normalizeRelative(file),
        line: lineForIndex(stripped, match.index || 0),
        target
      });
    }
  }

  return references;
}

function extractDuplicateIds(text, file) {
  if (path.extname(file) !== '.html') {
    return [];
  }

  const stripped = stripComments(text, '.html');
  const idPattern = /<[^>]+\sid\s*=\s*["']([^"']+)["'][^>]*>/gi;
  const seen = new Map();
  const duplicates = [];

  for (const match of stripped.matchAll(idPattern)) {
    const id = match[1];
    const line = lineForIndex(stripped, match.index || 0);
    if (!seen.has(id)) {
      seen.set(id, [line]);
      continue;
    }
    seen.get(id).push(line);
  }

  for (const [id, lines] of seen) {
    if (lines.length > 1) {
      duplicates.push({
        file: normalizeRelative(file),
        id,
        lines
      });
    }
  }

  return duplicates;
}

async function fileExistsForReference(sourceFile, target) {
  const sourceDir = path.dirname(path.join(rootDir, sourceFile));
  const candidate = path.resolve(sourceDir, target);
  try {
    await readFile(candidate);
    return true;
  } catch (_) {
    return false;
  }
}

function issueKey(issue, fields) {
  return fields.map((field) => issue[field]).join('\u0000');
}

function buildKnownSet(knownIssues, section, fields) {
  return new Set((knownIssues[section] || []).map((issue) => issueKey(issue, fields)));
}

function printKnown(title, issues, formatter) {
  if (issues.length === 0) {
    return;
  }

  console.log(`${title}: ${issues.length}`);
  for (const issue of issues) {
    console.log(`  - ${formatter(issue)}`);
  }
}

const knownIssues = JSON.parse(await readFile(knownIssuesPath, 'utf8'));
const knownMissingAssets = buildKnownSet(knownIssues, 'missingAssets', ['file', 'target']);
const knownMissingRoutes = buildKnownSet(knownIssues, 'missingRoutes', ['file', 'target']);
const knownDuplicateIds = buildKnownSet(knownIssues, 'duplicateIds', ['file', 'id']);

const files = await collectFiles(rootDir);
const missingAssets = [];
const knownAssets = [];
const missingRoutes = [];
const knownRoutes = [];
const duplicateIds = [];
const knownDuplicates = [];

for (const file of files) {
  const text = await readFile(file, 'utf8');

  for (const reference of extractAssetReferences(text, file)) {
    const exists = await fileExistsForReference(reference.file, reference.target);
    if (exists) {
      continue;
    }

    if (knownMissingAssets.has(issueKey(reference, ['file', 'target']))) {
      knownAssets.push(reference);
      continue;
    }

    missingAssets.push(reference);
  }

  for (const reference of extractRouteReferences(text, file)) {
    if (!routeExtensions.has(path.extname(reference.target))) {
      continue;
    }

    const exists = await fileExistsForReference(reference.file, reference.target);
    if (exists) {
      continue;
    }

    if (knownMissingRoutes.has(issueKey(reference, ['file', 'target']))) {
      knownRoutes.push(reference);
      continue;
    }

    missingRoutes.push(reference);
  }

  for (const duplicate of extractDuplicateIds(text, file)) {
    if (knownDuplicateIds.has(issueKey(duplicate, ['file', 'id']))) {
      knownDuplicates.push(duplicate);
      continue;
    }

    duplicateIds.push(duplicate);
  }
}

printKnown('Known missing assets', knownAssets, (issue) => `${issue.file}:${issue.line} -> ${issue.target}`);
printKnown('Known missing routes', knownRoutes, (issue) => `${issue.file}:${issue.line} -> ${issue.target}`);
printKnown('Known duplicate ids', knownDuplicates, (issue) => `${issue.file} #${issue.id} lines ${issue.lines.join(', ')}`);

const failures = [
  ...missingAssets.map((issue) => `Missing asset: ${issue.file}:${issue.line} -> ${issue.target}`),
  ...missingRoutes.map((issue) => `Missing route: ${issue.file}:${issue.line} -> ${issue.target}`),
  ...duplicateIds.map((issue) => `Duplicate id: ${issue.file} #${issue.id} lines ${issue.lines.join(', ')}`)
];

if (failures.length > 0) {
  console.error('Static inventory check failed:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(`Static inventory check passed (${files.length} files scanned).`);
