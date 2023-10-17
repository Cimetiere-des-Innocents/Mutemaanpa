import * as path from 'path';
import * as fs from 'fs';
import { HOOKS_ROOT, MUTEMAANPA_ROOT } from './paths.js';
import { parse, stringify } from 'comment-json';
import prettier from 'prettier';

const SETTINGS_DIR = path.resolve(MUTEMAANPA_ROOT, '.vscode');

const PRETTIER_CONFIG_FILE = path.resolve(HOOKS_ROOT, '.prettierrc.json');
const SETTINGS_FILE = path.resolve(SETTINGS_DIR, 'settings.json');
const DICT_FILE = path.resolve(SETTINGS_DIR, 'dict.json');

const PRETTIER_CONFIG = await prettier.resolveConfig(PRETTIER_CONFIG_FILE);

export async function extractDict() {
    console.log('提取字典...');

    const settingsExists = fs.existsSync(SETTINGS_FILE);
    if (!settingsExists) {
        console.log('settings.json不存在，跳过提取');
        return;
    }

    const dictExists = fs.existsSync(DICT_FILE);
    if (dictExists) {
        const settingsStat = fs.statSync(SETTINGS_FILE);
        const dictStat = fs.statSync(DICT_FILE);
        if (dictStat.mtimeMs >= settingsStat.mtimeMs) {
            console.log('dict.json更新于settings.json，跳过提取');
            return;
        }
    }

    const settings = parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    if (!settings || !(settings as any)['cSpell.words']) {
        console.log('字典为空，跳过提取');
        return;
    }

    const dict = (settings as any)['cSpell.words'];
    const dictStr = stringify(dict, null, 4);
    const dictStrPretty = await prettier.format(dictStr, { parser: 'json', ...PRETTIER_CONFIG });
    fs.writeFileSync(DICT_FILE, dictStrPretty);
    console.log('字典提取完成');
}

export async function applyDict() {
    console.log('应用字典...');

    const dictExists = fs.existsSync(DICT_FILE);
    if (!dictExists) {
        console.log('dict.json不存在，跳过应用');
        return;
    }

    const settingsExists = fs.existsSync(SETTINGS_FILE);
    if (dictExists && settingsExists) {
        const settingsStat = fs.statSync(SETTINGS_FILE);
        const dictStat = fs.statSync(DICT_FILE);
        if (dictStat.mtimeMs <= settingsStat.mtimeMs) {
            console.log('dict.json更新于settings.json，跳过应用');
            return;
        }
    }

    const dictStr = fs.readFileSync(DICT_FILE, 'utf-8');
    const dict = parse(dictStr);

    let settings: any;
    if (fs.existsSync(SETTINGS_FILE)) {
        settings = parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    } else {
        settings = {};
    }

    settings['cSpell.words'] = dict;
    const settingsStr = stringify(settings, null, 4);
    const settingsStrPretty = await prettier.format(settingsStr, { parser: 'json', ...PRETTIER_CONFIG });
    fs.writeFileSync(SETTINGS_FILE, settingsStrPretty);
    console.log('字典应用完成');
}
