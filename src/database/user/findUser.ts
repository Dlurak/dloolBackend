import { ObjectId } from 'mongodb';
import { UserWithId, usersCollection } from './user';

function findUsername(username: string) {
    return usersCollection.findOne({ username: username }).then((user) => {
        return user as UserWithId | null;
    });
}

export function findUserById(id: ObjectId) {
    return usersCollection.findOne({ _id: id }).then((user) => {
        return user as UserWithId | null;
    });
}

export default findUsername;
