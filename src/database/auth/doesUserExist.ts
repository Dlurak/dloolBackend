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

export default doesUsernameExist;
