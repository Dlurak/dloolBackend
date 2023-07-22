import * as bcrypt from 'bcrypt';
import { User, usersCollection } from './user';

/**
 * This function creates a user in the database and hashes the password
 * @param user The user to create the password should be in clear text
 */
export function createUser(user: User) {
    const passwordClear = user.password;
    const passwordHash = bcrypt.hashSync(passwordClear, 10);

    user.password = passwordHash;

    usersCollection
        .insertOne(user)
        .then((result) => {
            return true;
        })
        .catch((err) => {
            return false;
        });
}
