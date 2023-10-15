import type { Plugin } from 'vite';
import express from 'express';

export function testPlugin(): Plugin {
    const app = express();
    const router = express.Router();
    app.use(express.json());
    app.use('/api', router);

    return {
        name: 'test-plugin',
        configureServer: (server) => {
            server.httpServer?.on('request', app);
        },
    };
}
