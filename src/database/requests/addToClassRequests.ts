import { Collection, ObjectId } from 'mongodb';
import { db } from '../database';

export const addToClassRequestsCollection = db.collection(
    'addToClassRequests',
) as Collection<AddToClassRequest>;

export type AddToClassRequestStatus = 'pending' | 'accepted' | 'rejected';

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
    status: AddToClassRequestStatus;
    processedBy: ObjectId | null;
}
