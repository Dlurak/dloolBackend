import { classesCollection } from '../classes/class';
import { usersCollection } from './user';

/**
 * A function to check if a user exists
 * @param options The search options to find a user
 * @returns A boolean indicating whether the user exists
 */
async function doesUsernameExist(username: string): Promise<boolean> {
    const exists = usersCollection.findOne({ username }).then((user) => {
        return user !== null;
    });

    return exists;
}

export async function isUserMemberOfClass(
    username: string,
    className: string,
): Promise<boolean> {
    const userIdPromise = usersCollection.findOne({ username }).then((user) => {
        return user?._id;
    });
    const classMembersPromise = classesCollection
        .findOne({ name: className })
        .then((classObj) => {
            return classObj?.members;
        });

    const userId = await userIdPromise;
    const classMembers = await classMembersPromise;

    if (!userId || !classMembers) {
        return false;
    }

    const classmemberStrings = classMembers.map((member) => member.toString());
    const userIsMember = classmemberStrings.includes(userId.toString());
    return userIsMember;
}

export default doesUsernameExist;
