import { ObjectId } from 'mongodb';
import { addToClassRequestsCollection } from './addToClassRequests';

export function findSpecificRequestById(id: ObjectId) {
    const document = addToClassRequestsCollection.findOne({ _id: id });

    return document;
}
