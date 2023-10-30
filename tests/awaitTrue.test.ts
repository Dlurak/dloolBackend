import { describe, it } from 'vitest';
import { awaitTrue } from './utils/awaitTrue';

describe.concurrent('awaitTrue', async () => {
    it('instantly resolves', async ({ expect }) => {
        const start = Date.now();
        await awaitTrue(() => true);
        expect(Date.now() - start).toBeLessThan(100);
    });

    it('resolves after ~100ms', async ({ expect }) => {
        const start = Date.now();
        await awaitTrue(() => Date.now() - start > 100);
        const end = Date.now();

        expect(end - start).toBeGreaterThan(100);
        expect(end - start).toBeLessThan(300);
    });

    it('resolves after ~200ms', async ({ expect }) => {
        const start = Date.now();
        await awaitTrue(() => Date.now() - start > 200);
        const end = Date.now();

        expect(end - start).toBeGreaterThan(200);
        expect(end - start).toBeLessThan(400);
    });
});
