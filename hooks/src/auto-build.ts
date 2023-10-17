import { simpleGit } from 'simple-git';
import * as child_process from 'child_process';
import { HOOKS_ROOT, MUTEMAANPA_ROOT } from './utils/paths.js';

const git = simpleGit(MUTEMAANPA_ROOT);

console.log('检测Hooks变更...');

const diffParams = ['HEAD'];
if (process.argv[2] === 'pull') {
    diffParams.push('ORIG_HEAD');
}

const diff = await git.diffSummary(diffParams);

let changed = false;

for (const { file } of diff.files) {
    if (file.startsWith('hooks/')) {
        changed = true;
        break;
    }
}

if (changed) {
    console.log('Hooks已变更，开始构建...');
    child_process.execSync('npm install', { cwd: HOOKS_ROOT, stdio: 'inherit' });
    child_process.execSync('npm run build', { cwd: HOOKS_ROOT, stdio: 'inherit' });
    console.log('Hooks构建完成');
} else {
    console.log('Hooks未变更，跳过构建');
}
