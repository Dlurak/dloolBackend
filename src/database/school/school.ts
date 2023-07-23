import { Collection, ObjectId } from 'mongodb';
import { db } from '../database';

export const schoolsCollection = db.collection('schools') as Collection<School>;

schoolsCollection.createIndex({ name: 1 });
schoolsCollection.createIndex({ uniqueName: 1 }, { unique: true });
schoolsCollection.createIndex({ timezoneOffset: 1 });

export interface School {
    name: string;
    description: string;
    uniqueName: string;
    timezoneOffset: number;
    classes: ObjectId[];
}

export interface SchoolWithId extends School {
    _id: ObjectId;
}
