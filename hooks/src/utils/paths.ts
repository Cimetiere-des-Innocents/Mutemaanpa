import { fileURLToPath } from 'url';
import * as path from 'path';

const THIS_FILE = fileURLToPath(import.meta.url);

export const HOOKS_ROOT = path.resolve(path.dirname(THIS_FILE), '..', '..');

export const MUTEMAANPA_ROOT = path.resolve(HOOKS_ROOT, '..');
