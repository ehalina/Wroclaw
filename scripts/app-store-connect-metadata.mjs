import { createPrivateKey, sign } from 'node:crypto';
import { lstat, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const apiRoot = 'https://api.appstoreconnect.apple.com/v1';
const metadataPath = resolve(root, 'config/app-store-metadata.json');

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

async function token() {
  const keyPath = resolve(required('ASC_KEY_PATH'));
  const keyStat = await lstat(keyPath);
  if (!keyStat.isFile() || keyStat.isSymbolicLink()) throw new Error('ASC_KEY_PATH must be a regular file.');
  const key = createPrivateKey(await readFile(keyPath));
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({ alg: 'ES256', kid: required('ASC_KEY_ID'), typ: 'JWT' })}.${encode({ iss: required('ASC_ISSUER_ID'), aud: 'appstoreconnect-v1', iat: now, exp: now + 900 })}`;
  return `${unsigned}.${sign('sha256', Buffer.from(unsigned), { key, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
}

async function request(auth, path, method = 'GET', body) {
  const response = await fetch(`${apiRoot}${path}`, {
    method,
    headers: { Authorization: `Bearer ${auth}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = result.errors?.map((error) => `${error.status} ${error.code}: ${error.detail || error.title}`).join('; ');
    throw new Error(`${method} ${path}: ${details || response.status}`);
  }
  return result;
}

function body(type, id, attributes, relationships) {
  return { data: { type, ...(id ? { id } : {}), ...(attributes ? { attributes } : {}), ...(relationships ? { relationships } : {}) } };
}

function assertEditable(current, desired, context) {
  for (const [name, value] of Object.entries(desired)) {
    const present = current?.[name];
    if (context === 'iOS version' && name === 'releaseType' && present === 'AFTER_APPROVAL' && value === 'MANUAL') continue;
    if (present !== null && present !== undefined && present !== '' && present !== value) {
      throw new Error(`${context}.${name} already has a different value; review it before changing.`);
    }
  }
}

function validate(metadata) {
  if (metadata.schemaVersion !== 1 || metadata.bundleId !== 'com.event.horizon.wroclaw' || metadata.version !== '1.0') {
    throw new Error('Unexpected metadata schema, bundle ID, or version.');
  }
  if (metadata.primaryCategory !== 'TRAVEL' || metadata.secondaryCategory !== 'EDUCATION') throw new Error('Unexpected categories.');
  const limits = { name: 30, subtitle: 30, description: 4000, keywords: 100, promotionalText: 170 };
  for (const [locale, values] of Object.entries(metadata.localizations)) {
    if (!['en-US', 'ru', 'pl'].includes(locale)) throw new Error(`Unexpected locale ${locale}`);
    for (const [field, limit] of Object.entries(limits)) {
      const size = [...(values[field] || '')].length;
      if (size < 1 || size > limit) throw new Error(`${locale}.${field} has ${size} characters; limit ${limit}`);
    }
    for (const field of ['betaDescription', 'whatToTest']) {
      if (!values[field] || [...values[field]].length > 4000) throw new Error(`${locale}.${field} is missing or too long.`);
    }
  }
}

async function records(auth, metadata) {
  const apps = await request(auth, `/apps?filter[bundleId]=${encodeURIComponent(metadata.bundleId)}`);
  const app = apps.data?.[0];
  if (!app || app.attributes.bundleId !== metadata.bundleId) throw new Error('Wroclaw app record was not found.');
  const [infos, versions, beta, builds] = await Promise.all([
    request(auth, `/apps/${app.id}/appInfos?include=appInfoLocalizations,primaryCategory,secondaryCategory&limit[appInfoLocalizations]=50`),
    request(auth, `/apps/${app.id}/appStoreVersions?filter[platform]=IOS&filter[versionString]=${encodeURIComponent(metadata.version)}&include=appStoreVersionLocalizations&limit[appStoreVersionLocalizations]=50`),
    request(auth, `/apps/${app.id}/betaAppLocalizations`),
    request(auth, `/apps/${app.id}/builds?limit=50`),
  ]);
  const info = infos.data?.find((item) => item.attributes.appStoreState === 'PREPARE_FOR_SUBMISSION');
  const version = versions.data?.[0];
  const build = builds.data?.length === 1 && builds.data[0].attributes.version === '1' ? builds.data[0] : null;
  if (!info || version?.attributes.appStoreState !== 'PREPARE_FOR_SUBMISSION') throw new Error('Editable app info/version 1.0 was not found.');
  const buildLocales = build ? await request(auth, `/builds/${build.id}/betaBuildLocalizations`) : { data: [] };
  return {
    app,
    info,
    version,
    infoLocales: (infos.included || []).filter((item) => item.type === 'appInfoLocalizations'),
    versionLocales: (versions.included || []).filter((item) => item.type === 'appStoreVersionLocalizations'),
    betaLocales: beta.data || [],
    build,
    buildLocales: buildLocales.data || [],
  };
}

async function upsert(auth, mode, type, collection, existing, attributes, relationships, label) {
  assertEditable(existing?.attributes, attributes, label);
  const changes = Object.fromEntries(Object.entries(attributes).filter(([name, value]) => existing?.attributes?.[name] !== value));
  if (!Object.keys(changes).length) return;
  console.log(`${mode === 'apply' ? 'Write' : 'Would write'} ${label}: ${Object.keys(changes).join(', ')}`);
  if (mode !== 'apply') return;
  if (existing) await request(auth, `/${collection}/${existing.id}`, 'PATCH', body(type, existing.id, changes));
  else await request(auth, `/${collection}`, 'POST', body(type, null, changes, relationships));
}

async function main() {
  const mode = process.argv[2];
  if (!['inspect', 'dry-run', 'apply'].includes(mode)) throw new Error('Usage: make asc-inspect | make asc-dry-run | make asc-apply');
  const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
  validate(metadata);
  const auth = await token();
  const current = await records(auth, metadata);
  console.log(`App: ${current.app.attributes.name} (${current.app.attributes.bundleId}); iOS ${current.version.attributes.versionString}: ${current.version.attributes.appStoreState}`);
  if (mode === 'inspect') {
    console.log(`Categories: ${current.info.relationships?.primaryCategory?.data?.id || 'unset'} / ${current.info.relationships?.secondaryCategory?.data?.id || 'unset'}`);
    console.log(`Version: copyright=${current.version.attributes.copyright || 'unset'}, IDFA=${current.version.attributes.usesIdfa ?? 'unset'}, release=${current.version.attributes.releaseType || 'unset'}`);
    for (const [label, list] of [['app info', current.infoLocales], ['version', current.versionLocales], ['TestFlight', current.betaLocales], ['TestFlight build', current.buildLocales]]) {
      console.log(`${label}: ${list.map((item) => `${item.attributes.locale} (${Object.entries(item.attributes).filter(([key, value]) => key !== 'locale' && value != null && value !== '').map(([key]) => key).join(', ') || 'empty'})`).join('; ') || 'none'}`);
    }
    return;
  }
  const wantedCategories = { primaryCategory: metadata.primaryCategory, secondaryCategory: metadata.secondaryCategory };
  const currentCategories = Object.fromEntries(Object.keys(wantedCategories).map((key) => [key, current.info.relationships?.[key]?.data?.id]));
  assertEditable(currentCategories, wantedCategories, 'categories');
  if (Object.keys(wantedCategories).some((key) => currentCategories[key] !== wantedCategories[key])) {
    console.log(`${mode === 'apply' ? 'Write' : 'Would write'} categories: TRAVEL / EDUCATION`);
    if (mode === 'apply') await request(auth, `/appInfos/${current.info.id}`, 'PATCH', body('appInfos', current.info.id, null, {
      primaryCategory: { data: { type: 'appCategories', id: metadata.primaryCategory } },
      secondaryCategory: { data: { type: 'appCategories', id: metadata.secondaryCategory } },
    }));
  }
  await upsert(auth, mode, 'appStoreVersions', 'appStoreVersions', current.version,
    { copyright: metadata.copyright, usesIdfa: metadata.usesIdfa, releaseType: metadata.releaseType }, null, 'iOS version');
  for (const [locale, values] of Object.entries(metadata.localizations)) {
    const info = current.infoLocales.find((item) => item.attributes.locale === locale);
    const beta = current.betaLocales.find((item) => item.attributes.locale === locale);
    await upsert(auth, mode, 'appInfoLocalizations', 'appInfoLocalizations', info,
      { ...(info ? {} : { locale }), name: values.name, subtitle: values.subtitle },
      { appInfo: { data: { type: 'appInfos', id: current.info.id } } }, `${locale} app info`);
    const versionLocales = mode === 'apply'
      ? (await request(auth, `/appStoreVersions/${current.version.id}/appStoreVersionLocalizations`)).data || []
      : current.versionLocales;
    const version = versionLocales.find((item) => item.attributes.locale === locale);
    await upsert(auth, mode, 'appStoreVersionLocalizations', 'appStoreVersionLocalizations', version,
      { ...(version ? {} : { locale }), description: values.description, keywords: values.keywords, promotionalText: values.promotionalText },
      { appStoreVersion: { data: { type: 'appStoreVersions', id: current.version.id } } }, `${locale} store listing`);
    await upsert(auth, mode, 'betaAppLocalizations', 'betaAppLocalizations', beta,
      { ...(beta ? {} : { locale }), description: values.betaDescription },
      { app: { data: { type: 'apps', id: current.app.id } } }, `${locale} TestFlight app`);
    if (current.build) {
      const buildLocale = current.buildLocales.find((item) => item.attributes.locale === locale);
      await upsert(auth, mode, 'betaBuildLocalizations', 'betaBuildLocalizations', buildLocale,
        { ...(buildLocale ? {} : { locale }), whatsNew: values.whatToTest },
        { build: { data: { type: 'builds', id: current.build.id } } }, `${locale} TestFlight build 1.0 (1)`);
    }
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
