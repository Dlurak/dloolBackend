import { Collection, ObjectId } from 'mongodb';
import { db } from '../database';

export const classesCollection = db.collection('classes') as Collection<Class>;

classesCollection.createIndex({ name: 1, school: 1 }, { unique: true });

export interface Class {
    name: string;
    school: ObjectId;
    members: ObjectId[];
}

export interface ClassWithId extends Class {
    _id: ObjectId;
}
