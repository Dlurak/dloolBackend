import { ObjectId } from 'mongodb';
import { findSpecificRequestById } from './findAddToClassRequests';
import { createUser } from '../user/createUser';
import findUsername from '../user/findUser';
import { addMemberToClass } from '../classes/update';
import { addToClassRequestsCollection } from './addToClassRequests';

export async function acceptRequest(id: ObjectId, processedBy: ObjectId) {
    const request = await findSpecificRequestById(id);

    if (!request) return false;
    if (request.status !== 'pending') return false;

    await createUser(
        {
            name: request.userDetails.name,
            username: request.userDetails.username,
            password: request.userDetails.password,
            school: request.userDetails.school,
            classes: [request.classId],
        },
        true,
    );
    const newUser = await findUsername(request.userDetails.username);

    if (!newUser) return false;

    addMemberToClass(request.classId, newUser._id);

    console.log('Hello 2');

    // update the request

    await addToClassRequestsCollection.findOneAndUpdate(
        { _id: id },
        { $set: { status: 'accepted', processedBy } },
    );

    console.log('Hello 3');

    return true;
}

export async function rejectRequest(
    id: ObjectId,
    processedBy: ObjectId,
): Promise<boolean> {
    const thing = await addToClassRequestsCollection.findOneAndUpdate(
        { _id: id },
        { $set: { status: 'rejected', processedBy } },
    );

    if (!thing.value) return false;
    return true;
}
