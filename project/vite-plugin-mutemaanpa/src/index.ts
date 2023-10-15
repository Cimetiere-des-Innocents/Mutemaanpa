import type { Plugin } from 'vite';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import prettier from 'prettier';

export default function mutemaanpa(root: string): Plugin {
    const app = express();
    app.use(express.json());

    const publicPath = path.resolve(root, 'public');

    let prettierConfig: prettier.Options | undefined;

    app.get('/api', (_req, res) => {
        res.send('ok');
    });

    app.post('/api/save', async (req, res) => {
        if (!prettierConfig) {
            prettierConfig = (await prettier.resolveConfig(path.resolve(root, '.prettierrc.json'))) ?? undefined;
        }

        const { file, content } = req.body;
        if (!file.startsWith('/')) {
            res.status(400).send('Invalid file path');
            return;
        }

        const filePath = path.join(publicPath, file);
        const dir = path.dirname(filePath);

        try {
            await fs.promises.mkdir(dir, { recursive: true });
        } catch (e) {
            res.status(400).send('Failed to find file');
            return;
        }

        let formatted: string;
        try {
            formatted = await prettier.format(content, {
                ...prettierConfig,
                filepath: filePath,
            });
        } catch (e) {
            res.status(400).send('Invalid file content');
            return;
        }

        try {
            await fs.promises.writeFile(filePath, formatted);
        } catch (e) {
            res.status(500).send('Failed to write file');
            return;
        }

        res.send('ok');
    });

    return {
        name: 'vite-plugin-mutemaanpa',
        apply: 'serve',
        configureServer: (server) => () => {
            server.httpServer?.on('request', (req, res) => {
                if (req.url?.startsWith('/api')) {
                    app(req, res);
                }
            });
        },
    };
}
