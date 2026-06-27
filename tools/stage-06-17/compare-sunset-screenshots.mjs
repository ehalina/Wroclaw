import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const baselineDir = path.join(
  rootDir,
  process.env.STAGE_06_SUNSET_BASELINE_DIR || 'docs/refactoring/artifacts/stage-06-08-sunset'
);
const candidateDir = path.join(
  rootDir,
  process.env.STAGE_06_SUNSET_CANDIDATE_DIR || 'docs/refactoring/artifacts/stage-06-17-sunset-webp'
);
const minimumScore = Number(process.env.STAGE_06_SUNSET_MIN_SCORE || 90);

const screenshotPairs = [
  'desktop-initial.png',
  'desktop-after-1500ms.png',
  'mobile-pixel5-initial.png',
  'mobile-pixel5-after-1500ms.png'
];

async function compareScreenshot(fileName) {
  const baselinePath = path.join(baselineDir, fileName);
  const candidatePath = path.join(candidateDir, fileName);
  const { stdout } = await execFileAsync('ssimulacra2', [baselinePath, candidatePath]);
  const score = Number(stdout.trim());

  if (!Number.isFinite(score)) {
    throw new Error(`Could not parse ssimulacra2 score for ${fileName}: ${stdout}`);
  }

  return {
    candidate: path.relative(rootDir, candidatePath).split(path.sep).join('/'),
    baseline: path.relative(rootDir, baselinePath).split(path.sep).join('/'),
    fileName,
    pass: score >= minimumScore,
    score
  };
}

await mkdir(candidateDir, { recursive: true });
const results = [];

for (const fileName of screenshotPairs) {
  results.push(await compareScreenshot(fileName));
}

const report = {
  generatedAt: new Date().toISOString(),
  minimumScore,
  results
};

await writeFile(
  path.join(candidateDir, 'similarity-report.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8'
);

const failures = results.filter((result) => !result.pass);
if (failures.length > 0) {
  throw new Error(
    failures.map((result) => (
      `${result.fileName} score ${result.score.toFixed(2)} is below ${minimumScore}`
    )).join('\n')
  );
}

results.forEach((result) => {
  console.log(`${result.fileName}: ${result.score.toFixed(2)}`);
});
