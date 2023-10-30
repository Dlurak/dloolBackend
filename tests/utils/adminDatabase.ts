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
        .replace('<password>', process.env.MONGO_PASSWORD_TEST as string)
        .replace('<username>', process.env.MONGO_USERNAME_TEST || 'root')
        .replace('<dbname>', process.env.MONGO_DBNAME || 'test'),
);

export const getTestDbWithAdmin = () =>
    client.connect().then(() => client.db('test'));

export const closeTestDbWithAdmin = () => client.close();

export const dropTestDb = async () => {
    const db = await getTestDbWithAdmin();
    const dropped = await db.dropDatabase();
    await closeTestDbWithAdmin();
    return dropped;
};
