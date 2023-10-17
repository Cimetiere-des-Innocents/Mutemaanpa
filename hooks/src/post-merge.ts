import { autoBuild } from './utils/auto-build.js';
import { applyDict } from './utils/dict.js';

console.log('运行post-merge.ts');

await autoBuild('pull');
await applyDict();
