import { db } from '../database';

export const usersCollection = db.collection('users');

usersCollection.createIndex({ name: 1, school: 1, class: 1 }, { unique: true });
usersCollection.createIndex({ password: 1 });

export interface User {
    name: string;
    school: string;
    class: string;
    password: string;
}
