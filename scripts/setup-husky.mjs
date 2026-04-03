import {
  copyFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = process.cwd();
const huskyDir = join(repoRoot, '.husky');
const internalDir = join(huskyDir, '_');
const hooks = [
  'pre-commit',
  'pre-merge-commit',
  'prepare-commit-msg',
  'commit-msg',
  'post-commit',
  'applypatch-msg',
  'pre-applypatch',
  'post-applypatch',
  'pre-rebase',
  'post-rewrite',
  'post-checkout',
  'post-merge',
  'pre-push',
  'pre-auto-gc',
];
const __dirname = dirname(fileURLToPath(import.meta.url));
const huskyRuntime = join(__dirname, '..', 'node_modules', 'husky', 'husky');
const gitExecutable =
  process.platform === 'win32' ? 'C:\\Program Files\\Git\\cmd\\git.exe' : 'git';

if (!existsSync(join(repoRoot, '.git'))) {
  console.log(".git can't be found");
  process.exit(0);
}

const gitConfigResult = spawnSync(
  gitExecutable,
  ['config', 'core.hooksPath', '.husky/_'],
  {
    cwd: repoRoot,
    stdio: 'inherit',
  },
);

if (gitConfigResult.status !== 0) {
  process.exit(gitConfigResult.status ?? 1);
}

rmSync(join(internalDir, 'husky.sh'), { force: true });
mkdirSync(internalDir, { recursive: true });
writeFileSync(join(internalDir, '.gitignore'), '*\n');
copyFileSync(huskyRuntime, join(internalDir, 'h'));

for (const hook of hooks) {
  writeFileSync(
    join(internalDir, hook),
    '#!/usr/bin/env sh\n. "$(dirname "$0")/h"\n',
    { mode: 0o755 },
  );
}

writeFileSync(
  join(internalDir, 'husky.sh'),
  `echo "husky - DEPRECATED\n\nPlease remove the following two lines from $0:\n\n#!/usr/bin/env sh\n. \\"$(dirname -- \\"$0\\")/_/husky.sh\\"\n\nThey WILL FAIL in v10.0.0\n"\n`,
);
