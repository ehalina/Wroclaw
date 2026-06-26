import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = path.join(rootDir, 'locales');
const canonicalFile = 'translations.json';

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

const localeEntries = await readdir(localesDir, { withFileTypes: true });
const localeNames = localeEntries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const localeKeySets = new Map();
const parseFailures = [];
const duplicateFiles = [];

for (const locale of localeNames) {
  const localeDir = path.join(localesDir, locale);
  const canonicalPath = path.join(localeDir, canonicalFile);
  const legacyPath = path.join(localeDir, 'translation.json');

  try {
    const data = await readJson(canonicalPath);
    localeKeySets.set(locale, new Set(flattenKeys(data).filter(Boolean)));
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
  console.log('Translation key consistency warnings:');
  for (const warning of consistencyWarnings) {
    console.log(`  - ${warning.locale}: missing ${warning.missing.length}, extra ${warning.extra.length}`);
  }
  console.log('Use Stage 5 to make translation key consistency strict.');
}

console.log(`Translation parse check passed (${localeKeySets.size} locales, baseline: ${baselineLocale}).`);

