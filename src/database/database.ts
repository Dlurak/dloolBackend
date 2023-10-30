import { Db } from 'mongodb';
import * as mongodb from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.public' });
dotenv.config();

/**
 * The database connection
 */
const client = new mongodb.MongoClient(
    (process.env.MONGO_URI as string)
        .replace('<password>', process.env.MONGO_PASSWORD as string)
        .replace('<username>', process.env.MONGO_USERNAME || 'root')
        .replace('<dbname>', process.env.MONGO_DBNAME || 'test'),
);

export let dbIsConnected = false;

client
    .connect()
    .then(() => {
        dbIsConnected = true;
        console.log('MongoDB connection established');
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

/**
 * The right database
 */
export let db = client.db(
    {
        dev: 'dev',
        test: 'test',
        prod: 'prod',
    }[process.env.ENVIROMENT || 'dev'],
);

export const setDb = (newDbName: 'dev' | 'test' | 'prod') => {
    db = client.db(newDbName);
};

process.on('SIGINT', () => {
    client.close().then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});
