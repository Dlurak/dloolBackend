import { Collection, ObjectId } from 'mongodb';
import { db } from '../database';

export const addToClassRequestsCollection = db.collection(
    'addToClassRequests',
) as Collection<AddToClassRequest>;

export interface AddToClassRequest {
    userDetails: {
        name: string;
        username: string;
        createdAt: number;
        school: ObjectId;
        password: string;
        acceptedClasses: ObjectId[];
    };
    classId: ObjectId;
    createdAt: number;
    status: 'pending' | 'accepted' | 'rejected';
}
