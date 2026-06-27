import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = path.join(rootDir, 'locales');
const canonicalFile = 'translations.json';
const richHtmlKeys = new Set([
  'gnomes.blue_goat.description',
  'jan_nepomuk.book02.zone4-2.text',
  'tumski.book02.zone1.text',
  'tumski_cathedral.book02.zone4.text',
  'tumski_most.book02.zone1.text',
  'tumski_most.book02.zone3.text',
  'tumski_most.book02.zone4.text'
]);
const allowedRichTags = new Set(['br']);

function flattenKeys(value, prefix = '') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix];
  }

  const keys = [];
  for (const [key, child] of Object.entries(value)) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    keys.push(...flattenKeys(child, nextPrefix));
  }
  return keys;
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    throw new Error(`${path.relative(rootDir, file)}: ${error.message}`);
  }
}

function collectHtmlIssues(value, locale, prefix = '') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    if (typeof value !== 'string') {
      return [];
    }

    const issues = [];
    const tagMatches = [...value.matchAll(/<\s*\/?\s*([a-zA-Z0-9-]+)(?:\s[^>]*)?>/g)];
    if (tagMatches.length === 0) {
      return issues;
    }

    if (!richHtmlKeys.has(prefix)) {
      issues.push(`${locale}:${prefix} contains HTML but is not in richHtmlKeys`);
    }

    for (const match of tagMatches) {
      const rawTag = match[0];
      const tagName = match[1].toLowerCase();
      if (!allowedRichTags.has(tagName)) {
        issues.push(`${locale}:${prefix} uses disallowed tag ${rawTag}`);
      } else if (!/^<br\s*\/?>$/i.test(rawTag)) {
        issues.push(`${locale}:${prefix} uses non-canonical br tag ${rawTag}`);
      }
    }

    return issues;
  }

  const issues = [];
  for (const [key, child] of Object.entries(value)) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    issues.push(...collectHtmlIssues(child, locale, nextPrefix));
  }
  return issues;
}

const localeEntries = await readdir(localesDir, { withFileTypes: true });
const localeNames = localeEntries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const localeKeySets = new Map();
const parseFailures = [];
const duplicateFiles = [];
const htmlIssues = [];

for (const locale of localeNames) {
  const localeDir = path.join(localesDir, locale);
  const canonicalPath = path.join(localeDir, canonicalFile);
  const legacyPath = path.join(localeDir, 'translation.json');

  try {
    const data = await readJson(canonicalPath);
    localeKeySets.set(locale, new Set(flattenKeys(data).filter(Boolean)));
    htmlIssues.push(...collectHtmlIssues(data, locale));
  } catch (error) {
    parseFailures.push(error.message);
  }

  try {
    await readFile(legacyPath, 'utf8');
    duplicateFiles.push(path.relative(rootDir, legacyPath));
  } catch (_) {
    // No legacy file in this locale.
  }
}

if (parseFailures.length > 0) {
  console.error('Translation JSON parse check failed:');
  for (const failure of parseFailures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

if (htmlIssues.length > 0) {
  console.error('Translation rich HTML allowlist check failed:');
  for (const issue of htmlIssues) {
    console.error(`  - ${issue}`);
  }
  process.exit(1);
}

const baselineLocale = localeKeySets.has('en') ? 'en' : localeNames[0];
const baselineKeys = localeKeySets.get(baselineLocale) || new Set();
const consistencyWarnings = [];

for (const [locale, keys] of localeKeySets) {
  const missing = [...baselineKeys].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !baselineKeys.has(key));

  if (missing.length > 0 || extra.length > 0) {
    consistencyWarnings.push({
      locale,
      missing,
      extra
    });
  }
}

if (duplicateFiles.length > 0) {
  console.log(`Legacy locale files present (${duplicateFiles.length}); canonical runtime file is ${canonicalFile}:`);
  for (const file of duplicateFiles) {
    console.log(`  - ${file}`);
  }
}

if (consistencyWarnings.length > 0) {
  console.error('Translation key consistency check failed:');
  for (const warning of consistencyWarnings) {
    console.error(`  - ${warning.locale}: missing ${warning.missing.length}, extra ${warning.extra.length}`);
    for (const key of warning.missing) {
      console.error(`    missing: ${key}`);
    }
    for (const key of warning.extra) {
      console.error(`    extra: ${key}`);
    }
  }
  process.exit(1);
}

console.log(`Translation parse check passed (${localeKeySets.size} locales, baseline: ${baselineLocale}).`);
console.log(`Translation key consistency check passed (${localeKeySets.size} locales, baseline: ${baselineLocale}).`);
console.log(`Translation rich HTML allowlist check passed (${richHtmlKeys.size} keys, tags: ${[...allowedRichTags].join(', ')}).`);
