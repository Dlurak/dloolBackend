import { ObjectId, WithId } from 'mongodb';
import findUsername from '../user/findUser';
import {
    AddToClassRequest,
    addToClassRequestsCollection,
} from './addToClassRequests';

export async function createAddToClassRequest(request: AddToClassRequest) {
    const username = request.userDetails.username;

    addToClassRequestsCollection
        .find({ 'userDetails.username': username })
        .toArray()
        .then((list) => {
            if (list.length !== 0) {
                return null;
            }
        });

    const userReal = await findUsername(username);
    if (userReal) return null;

    request.createdAt = Date.now();
    request.status = 'pending';
    request.processedBy = null;

    return addToClassRequestsCollection
        .insertOne(request)
        .then((value) => {
            return {
                ...request,
                _id: value.insertedId,
            } as WithId<AddToClassRequest>;
        })
        .catch(() => {
            return null;
        });
}
