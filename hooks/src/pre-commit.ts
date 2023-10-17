import { autoBuild } from './utils/auto-build.js';
import { extractDict } from './utils/dict.js';

console.log('运行pre-commit.ts');

await autoBuild('commit');

await extractDict();
