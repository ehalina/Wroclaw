import { createHash, createPrivateKey, sign } from 'node:crypto';
import { lstat, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const apiRoot = 'https://api.appstoreconnect.apple.com/v1';
const screenshotRoot = resolve(root, 'artifacts/store-screenshots');
const bundleId = 'com.event.horizon.wroclaw';
const profiles = {
  'ios-phone': { type: 'APP_IPHONE_67', width: 2868, height: 1320 },
  'ios-tablet': { type: 'APP_IPAD_PRO_3GEN_129', width: 2752, height: 2064 },
};
const languages = { 'en-US': 'en', ru: 'ru', pl: 'pl' };
const states = ['start', 'map', 'story'];

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

async function api(auth, path, method = 'GET', data, raw = false) {
  const response = await fetch(`${apiRoot}${path}`, {
    method,
    headers: { Authorization: `Bearer ${auth}`, 'Content-Type': 'application/json' },
    ...(data ? { body: JSON.stringify(raw ? data : { data }) } : {}),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = result.errors?.map((error) => `${error.status} ${error.code}: ${error.detail || error.title}`).join('; ');
    throw new Error(`${method} ${path}: ${details || response.status}`);
  }
  return result;
}

function data(type, attributes, relationships, id) {
  return { type, ...(id ? { id } : {}), ...(attributes ? { attributes } : {}), ...(relationships ? { relationships } : {}) };
}

async function localFile(language, profileName, state) {
  const path = resolve(screenshotRoot, language, profileName, `${state}.png`);
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Screenshot must be a regular file: ${path}`);
  const bytes = await readFile(path);
  const pngSignature = Buffer.from('89504e470d0a1a0a', 'hex');
  if (!bytes.subarray(0, 8).equals(pngSignature) || bytes.toString('ascii', 12, 16) !== 'IHDR') throw new Error(`Not a PNG: ${path}`);
  const profile = profiles[profileName];
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  const colorType = bytes[25];
  if (width !== profile.width || height !== profile.height || colorType !== 2) {
    throw new Error(`Unexpected size or alpha/color mode for ${path}: ${width}x${height}, PNG color type ${colorType}`);
  }
  return {
    fileName: `${language}-${profileName}-${state}.png`,
    bytes,
    checksum: createHash('md5').update(bytes).digest('hex'),
  };
}

async function appVersionLocalizations(auth) {
  const apps = await api(auth, `/apps?filter[bundleId]=${encodeURIComponent(bundleId)}`);
  const app = apps.data?.find((item) => item.attributes.bundleId === bundleId);
  if (!app) throw new Error('Wroclaw app was not found.');
  const versions = await api(auth, `/apps/${app.id}/appStoreVersions?filter[platform]=IOS&filter[versionString]=1.0`);
  const version = versions.data?.find((item) => item.attributes.versionString === '1.0' && item.attributes.appStoreState === 'PREPARE_FOR_SUBMISSION');
  if (!version) throw new Error('Editable iOS 1.0 version was not found.');
  const result = await api(auth, `/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=50`);
  for (const locale of Object.keys(languages)) {
    if (!result.data?.some((item) => item.attributes.locale === locale)) throw new Error(`Missing ${locale} App Store localization.`);
  }
  return result.data;
}

async function uploadParts(operations, bytes) {
  if (!operations?.length) throw new Error('Apple provided no upload operations.');
  for (const operation of operations) {
    const url = new URL(operation.url);
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.apple.com')) throw new Error('Unexpected upload host.');
    const { offset, length } = operation;
    if (!Number.isInteger(offset) || !Number.isInteger(length) || offset < 0 || length < 1 || offset + length > bytes.length) {
      throw new Error('Invalid upload byte range.');
    }
    const headers = Object.fromEntries((operation.requestHeaders || []).map(({ name, value }) => [name, value]));
    const response = await fetch(url, { method: operation.method, headers, body: bytes.subarray(offset, offset + length) });
    if (!response.ok) throw new Error(`Screenshot binary upload failed: HTTP ${response.status}`);
  }
}

async function ensureScreenshot(auth, mode, setId, existing, file) {
  let screenshot = existing.find((item) => item.attributes.fileName === file.fileName);
  if (screenshot?.attributes.sourceFileChecksum && screenshot.attributes.sourceFileChecksum !== file.checksum) {
    throw new Error(`Remote ${file.fileName} differs from local file; review before replacing.`);
  }
  if (screenshot && screenshot.attributes.fileSize !== file.bytes.length) throw new Error(`Remote ${file.fileName} has a different size.`);
  const status = screenshot?.attributes.assetDeliveryState?.state;
  if (screenshot && status !== 'AWAITING_UPLOAD') {
    console.log(`${file.fileName}: ${status || 'existing'}`);
    return screenshot.id;
  }
  console.log(`${mode === 'apply' ? 'Upload' : 'Would upload'} ${file.fileName} (${file.bytes.length} bytes)`);
  if (mode !== 'apply') return null;
  if (!screenshot) {
    const reservation = await api(auth, '/appScreenshots', 'POST', data('appScreenshots', {
      fileName: file.fileName,
      fileSize: file.bytes.length,
    }, { appScreenshotSet: { data: { type: 'appScreenshotSets', id: setId } } }));
    screenshot = reservation.data;
  } else if (!screenshot.attributes.uploadOperations?.length) {
    screenshot = (await api(auth, `/appScreenshots/${screenshot.id}`)).data;
  }
  await uploadParts(screenshot.attributes.uploadOperations, file.bytes);
  await api(auth, `/appScreenshots/${screenshot.id}`, 'PATCH', data('appScreenshots', {
    uploaded: true,
    sourceFileChecksum: file.checksum,
  }, null, screenshot.id));
  return screenshot.id;
}

async function ensureSet(auth, mode, localization, profileName) {
  const type = profiles[profileName].type;
  const sets = await api(auth, `/appStoreVersionLocalizations/${localization.id}/appScreenshotSets?limit=50`);
  let set = sets.data?.find((item) => item.attributes.screenshotDisplayType === type);
  if (!set) {
    console.log(`${mode === 'apply' ? 'Create' : 'Would create'} ${localization.attributes.locale} ${type} screenshot set`);
    if (mode !== 'apply') return null;
    set = (await api(auth, '/appScreenshotSets', 'POST', data('appScreenshotSets', {
      screenshotDisplayType: type,
    }, { appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id: localization.id } } }))).data;
  }
  return set.id;
}

async function main() {
  const mode = process.argv[2];
  if (!['inspect', 'dry-run', 'apply'].includes(mode)) throw new Error('Usage: make asc-screenshots-inspect | make asc-screenshots-dry-run | make asc-screenshots-apply');
  const files = new Map();
  for (const [locale, language] of Object.entries(languages)) {
    for (const profile of Object.keys(profiles)) {
      files.set(`${locale}/${profile}`, await Promise.all(states.map((state) => localFile(language, profile, state))));
    }
  }
  const auth = await token();
  const localizations = await appVersionLocalizations(auth);
  for (const [locale] of Object.entries(languages)) {
    const localization = localizations.find((item) => item.attributes.locale === locale);
    for (const profileName of Object.keys(profiles)) {
      const setId = await ensureSet(auth, mode, localization, profileName);
      if (!setId) {
        for (const file of files.get(`${locale}/${profileName}`)) console.log(`Would upload ${file.fileName} (${file.bytes.length} bytes)`);
        continue;
      }
      const screenshots = (await api(auth, `/appScreenshotSets/${setId}/appScreenshots?limit=50`)).data || [];
      console.log(`${locale}/${profileName}: ${screenshots.length} remote screenshots`);
      if (mode === 'inspect') {
        for (const item of screenshots) console.log(`  ${item.attributes.fileName}: ${item.attributes.assetDeliveryState?.state || 'unknown'}`);
        continue;
      }
      const ids = [];
      for (const file of files.get(`${locale}/${profileName}`)) {
        const id = await ensureScreenshot(auth, mode, setId, screenshots, file);
        if (id) ids.push(id);
      }
      if (mode === 'apply' && screenshots.length === 0 && ids.length === states.length) {
        await api(auth, `/appScreenshotSets/${setId}/relationships/appScreenshots`, 'PATCH', {
          data: ids.map((id) => ({ type: 'appScreenshots', id })),
        }, true);
      }
    }
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
