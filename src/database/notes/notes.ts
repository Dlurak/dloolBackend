import { Collection, ObjectId } from 'mongodb';
import { db } from '../database';

export const noteCollection = db.collection('notes') as Collection<Note>;

export type Visibility = 'public' | 'private';
export interface Note {
    creator: ObjectId;

    createdAt: number; // timestamp

    title: string;
    content: string;
    due: {
        year: number;
        month: number;
        day: number;
    };

    visibility: Visibility;
    class?: ObjectId;
}
