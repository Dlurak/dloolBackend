import { serverIsRunning } from '../../src/index';
import { awaitTrue } from './awaitTrue';

export const startServer = async () => {
    await import('../../src/index');
    await awaitTrue(() => serverIsRunning);
};
