import { createServer } from 'node:http';
import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const webRoot = resolve(root, 'www');
const profiles = {
  'ios-phone': { viewport: { width: 1434, height: 660 }, scale: 2 },
  'ios-tablet': { viewport: { width: 1376, height: 1032 }, scale: 2 },
  'android-phone': { viewport: { width: 412, height: 915 }, scale: 2.625 },
};
const languages = ['en', 'ru', 'pl'];
const states = ['start', 'map', 'story'];
const contentTypes = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.woff2': 'font/woff2',
};

function inside(parent, child) {
  const difference = relative(parent, child);
  return difference === '' || (difference !== '..' && !difference.startsWith(`..${sep}`) && !isAbsolute(difference));
}

function selection(value, valid, label) {
  if (value === 'all') return valid;
  const selected = [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];
  if (!selected.length || selected.some((item) => !valid.includes(item))) throw new Error(`Invalid ${label}: ${value}`);
  return selected;
}

function parse(argv) {
  const opts = { profile: 'all', language: 'all', state: 'all', output: 'artifacts/store-screenshots', delay: 1000, dryRun: false, baseUrl: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key === '--dry-run') opts.dryRun = true;
    else if (key === '--help' || key === '-h') {
      console.log('Usage: make store-screenshots SCREENSHOT_ARGS="[--profile ios-phone,ios-tablet,android-phone|all] [--language en,ru,pl|all] [--state start,map,story|all] [--output artifacts/store-screenshots] [--dry-run]"');
      process.exit(0);
    } else if (['--profile', '--language', '--state', '--output', '--delay-ms', '--base-url'].includes(key) && argv[i + 1]) {
      const value = argv[++i];
      if (key === '--delay-ms') opts.delay = Number(value);
      else opts[key.slice(2).replace('base-url', 'baseUrl')] = value;
    } else throw new Error(`Unknown or incomplete argument: ${key}`);
  }
  opts.profiles = selection(opts.profile, Object.keys(profiles), 'profile');
  opts.languages = selection(opts.language, languages, 'language');
  opts.states = selection(opts.state, states, 'state');
  if (!Number.isSafeInteger(opts.delay) || opts.delay < 0) throw new Error('--delay-ms must be a nonnegative integer.');
  const output = resolve(root, opts.output);
  if (!inside(root, output) || output === root) throw new Error('Output must stay inside the repository.');
  opts.output = output;
  if (opts.baseUrl && !/^https?:\/\//u.test(opts.baseUrl)) throw new Error('--base-url must be HTTP(S).');
  return opts;
}

async function localServer() {
  const canonicalRoot = await realpath(webRoot);
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', 'http://127.0.0.1');
      const name = decodeURIComponent(url.pathname).replace(/\/$/u, '/index.html');
      const target = resolve(webRoot, `.${name}`);
      if (!inside(webRoot, target)) throw new Error('Outside web root');
      const canonical = await realpath(target);
      if (!inside(canonicalRoot, canonical) || !(await lstat(canonical)).isFile()) throw new Error('Unsafe file');
      response.writeHead(200, { 'Content-Type': contentTypes[extname(canonical)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      response.end(await readFile(canonical));
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  await new Promise((done, fail) => { server.once('error', fail); server.listen(0, '127.0.0.1', done); });
  return { server, baseUrl: `http://127.0.0.1:${server.address().port}/` };
}

async function capture(browser, baseUrl, output, profileName, language, state, delay) {
  const profile = profiles[profileName];
  const context = await browser.newContext({ viewport: profile.viewport, deviceScaleFactor: profile.scale, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  try {
    await context.addInitScript((locale) => {
      localStorage.setItem('selectedLanguage', locale);
      localStorage.setItem('soundMuted', 'true');
    }, language);
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const frame = page.frameLocator('.page-content.active iframe').first();
    await frame.locator('body').waitFor({ state: 'visible', timeout: 30000 });
    await page.evaluate(async (locale) => {
      localStorage.setItem('selectedLanguage', locale);
      await window.i18n.changeLang(locale);
      window.LanguageMenu.updateIframeLocalization(locale);
    }, language);
    const audioPrompt = page.locator('#audioUnlockButton');
    if (await audioPrompt.isVisible()) {
      await audioPrompt.click();
      await audioPrompt.waitFor({ state: 'hidden', timeout: 10000 });
    }
    if (state === 'map') {
      await frame.locator('#open-map-modal').click();
      await page.locator('#mini-map-expand').click();
      await frame.locator('#map-modal').waitFor({ state: 'visible' });
    } else if (state === 'story') {
      await page.evaluate(() => window.spaManager.loadPage('tumski02.html'));
      await frame.locator('body').waitFor({ state: 'visible' });
    }
    await page.waitForTimeout(delay);
    const destination = resolve(output, language, profileName, `${state}.png`);
    await mkdir(dirname(destination), { recursive: true });
    const canonicalDirectory = await realpath(dirname(destination));
    if (!inside(await realpath(root), canonicalDirectory)) throw new Error(`Output resolves outside the repository: ${destination}`);
    try {
      if ((await lstat(destination)).isSymbolicLink()) throw new Error(`Refusing to overwrite symlink: ${destination}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const data = await page.screenshot({ animations: 'disabled' });
    const actual = [data.readUInt32BE(16), data.readUInt32BE(20)];
    const expected = [Math.round(profile.viewport.width * profile.scale), Math.round(profile.viewport.height * profile.scale)];
    if (actual[0] !== expected[0] || actual[1] !== expected[1]) throw new Error(`Unexpected screenshot size ${actual.join('x')} for ${profileName}; expected ${expected.join('x')}.`);
    await writeFile(destination, data);
    console.log(`${language}/${profileName}/${state}.png ${actual.join('x')}`);
  } finally {
    await context.close();
  }
}

async function main() {
  const opts = parse(process.argv.slice(2));
  const matrix = opts.languages.flatMap((language) => opts.profiles.flatMap((profile) => opts.states.map((state) => [language, profile, state])));
  console.log(`Output: ${opts.output}`);
  console.log(`Capture count: ${matrix.length}`);
  if (opts.dryRun) { matrix.forEach((row) => console.log(row.join('/'))); return; }
  const { server, baseUrl } = opts.baseUrl ? { server: null, baseUrl: opts.baseUrl } : await localServer();
  const browser = await chromium.launch();
  try {
    for (const [language, profile, state] of matrix) await capture(browser, baseUrl, opts.output, profile, language, state, opts.delay);
  } finally {
    await browser.close();
    if (server) await new Promise((done) => server.close(done));
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
