import { spawnSync } from 'node:child_process';
import { lstat, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDefault = resolve(root, 'resources/icon-source.png');
const iosIcon = resolve(root, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
const androidRes = resolve(root, 'android/app/src/main/res');
const densities = [
  ['mdpi', 48, 108], ['hdpi', 72, 162], ['xhdpi', 96, 216],
  ['xxhdpi', 144, 324], ['xxxhdpi', 192, 432],
];
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function options(argv) {
  const result = { ios: false, android: false, dryRun: false, source: sourceDefault };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--ios') result.ios = true;
    else if (arg === '--android') result.android = true;
    else if (arg === '--all') result.ios = result.android = true;
    else if (arg === '--dry-run') result.dryRun = true;
    else if (arg === '--source' && argv[i + 1]) result.source = resolve(argv[++i]);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: make icons [ICON_ARGS="--ios|--android|--all [--source PNG] [--dry-run]"]');
      process.exit(0);
    } else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  if (!result.ios && !result.android) result.ios = result.android = true;
  return result;
}

async function readSource(path) {
  const stats = await lstat(path);
  if (!stats.isFile() || stats.isSymbolicLink()) throw new Error('Icon source must be a regular PNG file.');
  const data = await readFile(path);
  if (data.length < 33 || !data.subarray(0, 8).equals(pngSignature)) throw new Error('Icon source is not PNG.');
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  const colorType = data[25];
  if (width !== height || width < 1024) throw new Error(`Icon source must be square and at least 1024px; got ${width}x${height}.`);
  if (colorType === 4 || colorType === 6) throw new Error('Icon source must be opaque (no alpha channel).');
  return { width, height };
}

function resize(source, destination, size) {
  const result = spawnSync('/usr/bin/sips', ['-s', 'format', 'png', '-z', String(size), String(size), source, '--out', destination], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`sips failed: ${(result.stderr || result.stdout).trim()}`);
}

async function main() {
  const opts = options(process.argv.slice(2));
  const dimensions = await readSource(opts.source);
  if (process.platform !== 'darwin') throw new Error('Icon generation requires macOS sips.');
  console.log(`Source: ${opts.source} (${dimensions.width}x${dimensions.height})`);
  if (opts.ios) console.log(`iOS: ${iosIcon}`);
  if (opts.android) console.log(`Android: ${androidRes}/mipmap-*`);
  if (opts.dryRun) return;
  if (opts.ios) resize(opts.source, iosIcon, 1024);
  if (opts.android) {
    for (const [density, legacySize, foregroundSize] of densities) {
      const directory = resolve(androidRes, `mipmap-${density}`);
      await mkdir(directory, { recursive: true });
      for (const name of ['ic_launcher.png', 'ic_launcher_round.png']) {
        resize(opts.source, resolve(directory, name), legacySize);
      }
      resize(opts.source, resolve(directory, 'ic_launcher_foreground.png'), foregroundSize);
    }
  }
  console.log('Icons generated. Inspect iOS and Android adaptive masks before publishing.');
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
