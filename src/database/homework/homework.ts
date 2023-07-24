import { Collection, ObjectId } from 'mongodb';
import { db } from '../database';

export const homeworkCollection = db.collection('homework') as Collection<Homework>;

export interface Homework {
    creator: ObjectId;
    class: ObjectId;

    createdAt: number; // timestamp

    from: {
        year: number;
        month: number;
        day: number;
    }

    assignments: {
        subject: string;
        description: string;
        due: {
            year: number;
            month: number;
            day: number;
        }
    }[]
}
