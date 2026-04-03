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

run(nodeExecutable, [prettierBin, '--check', '.']);
run(nodeExecutable, [eslintBin, '.', '--max-warnings=0']);

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
