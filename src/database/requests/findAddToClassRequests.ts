import { ObjectId } from 'mongodb';
import {
    AddToClassRequestStatus,
    addToClassRequestsCollection,
} from './addToClassRequests';

export function findSpecificRequestById(id: ObjectId) {
    const document = addToClassRequestsCollection.findOne({ _id: id });

    return document;
}

export function findRequestsByClassId(
    classId: ObjectId,
    status?: AddToClassRequestStatus,
) {
    const filter = status ? { classId, status } : { classId };
    const documents = addToClassRequestsCollection.find(filter).toArray();

    return documents;
}

export const doesRequestExist = (username: string): Promise<boolean> => {
    const doc = addToClassRequestsCollection.findOne({
        'userDetails.username': username,
    });
    return doc.then((d) => !!d);
};
