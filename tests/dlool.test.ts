import { afterAll, describe, it, expect, afterEach, beforeEach } from 'vitest';

import { awaitTrue } from './utils/awaitTrue';

import { db, dbIsConnected, setDb } from '../src/database/database';
import { server, serverIsRunning } from '../src/index';
import { startServer } from './utils/startServer';
import { dropTestDb } from './utils/adminDatabase';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.public' });

describe('the basic server', () => {
    it('runs', async () => {
        const index = await fetch(
            `http://localhost:${process.env.PORT || 3000}`,
        );
        expect(index.status).toBe(200);
        expect(await index.json()).toEqual({
            name: 'Dlool',
            isDlool: true,
        });
    });

    it('drops the right db', async () => {
        const dropped = await dropTestDb();
        expect(dropped).toBe(true);
    });
});

beforeEach(async () => {
    await startServer();
    await awaitTrue(() => serverIsRunning);
    await awaitTrue(() => dbIsConnected);
    expect(serverIsRunning).toBe(true);
    expect(dbIsConnected).toBe(true);

    setDb('test');
    expect(db.databaseName).toBe('test');
});

afterEach(async () => {
    await server.close();
});
