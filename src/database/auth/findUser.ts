import { UserWithId, usersCollection } from './user';

function findUsername(username: string) {
    return usersCollection.findOne({ username: username }).then((user) => {
        return user as UserWithId | null;
    });
}

export default findUsername;
