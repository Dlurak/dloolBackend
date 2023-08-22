import { ObjectId } from 'mongodb';
import { findSpecificRequestById } from './findAddToClassRequests';
import { createUser } from '../user/createUser';
import findUsername from '../user/findUser';
import { addMemberToClass } from '../classes/update';
import { addToClassRequestsCollection } from './addToClassRequests';

export async function acceptRequest(id: ObjectId) {
    const request = await findSpecificRequestById(id);

    if (!request) return false;
    if (request.status !== 'pending') return false;

    createUser({
        name: request.userDetails.name,
        username: request.userDetails.username,
        password: request.userDetails.password,
        school: request.userDetails.school,
        classes: [request.classId],
    });
    const newUser = await findUsername(request.userDetails.username);

    if (!newUser) return false;

    addMemberToClass(request.classId, newUser._id);

    // update the request

    await addToClassRequestsCollection.findOneAndUpdate(
        { _id: id },
        { $set: { status: 'accepted' } },
    );

    return true;
}

export async function rejectRequest(id: ObjectId) {
    const thing = await addToClassRequestsCollection.findOneAndUpdate(
        { _id: id },
        { $set: { status: 'rejected' } },
    );

    if (!thing.value) return false;
    return true;
}
