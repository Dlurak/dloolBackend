import { ObjectId } from 'mongodb';
import { db } from '../database';

export const usersCollection = db.collection('users');

usersCollection.createIndex({ username: 1 }, { unique: true });
usersCollection.createIndex({ name: 1, school: 1, class: 1 });
usersCollection.createIndex({ password: 1 });

export interface User {
    username: string;
    name: string;
    school: ObjectId;
    classes: ObjectId[];
    password: string;
}

export interface UserWithId extends User {
    _id: ObjectId;
}
