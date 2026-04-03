import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const repoRoot = process.cwd();
const nodeExecutable = process.execPath;
const prettierBin = path.join(
  repoRoot,
  'node_modules',
  'prettier',
  'bin',
  'prettier.cjs',
);
const eslintBin = path.join(
  repoRoot,
  'node_modules',
  'eslint',
  'bin',
  'eslint.js',
);

const inputFiles = process.argv
  .slice(2)
  .map((file) => file.trim())
  .filter(Boolean)
  .filter((file) => existsSync(path.join(repoRoot, file)));

if (!inputFiles.length) {
  process.exit(0);
}

const prettierExtensions = new Set([
  '.ts',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.yml',
  '.yaml',
]);
const eslintExtensions = new Set(['.ts', '.js', '.mjs', '.cjs']);

const prettierFiles = inputFiles.filter((file) =>
  prettierExtensions.has(path.extname(file).toLowerCase()),
);
const eslintFiles = inputFiles.filter((file) =>
  eslintExtensions.has(path.extname(file).toLowerCase()),
);

if (prettierFiles.length) {
  run(nodeExecutable, [prettierBin, '--write', ...prettierFiles]);
}

if (eslintFiles.length) {
  run(nodeExecutable, [eslintBin, '--fix', '--max-warnings=0', ...eslintFiles]);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    if (result.error) {
      console.error(result.error.message);
    }

    process.exit(result.status ?? 1);
  }
}
