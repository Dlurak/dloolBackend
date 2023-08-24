import * as bcrypt from 'bcrypt';
import { User, usersCollection } from './user';
import { findUniqueSchoolById } from '../school/findSchool';
import { getUniqueClassById } from '../classes/findClass';

/**
 * This function creates a user in the database and hashes the password
 * @param user The user to create the password should be in clear text
 * @param hashedPassword Whether the password is already hashed
 */
export function createUser(user: User, hashedPassword = false) {
    // check that a school with the given id exists
    findUniqueSchoolById(user.school).then((school) => {
        if (school === null) {
            throw new Error('School does not exist');
        }
    });
    if (user.classes.length <= 0) {
        throw new Error('User must be in at least one class');
    }
    user.classes.forEach((classId) => {
        getUniqueClassById(classId).then((class_) => {
            if (class_ === null) {
                throw new Error('Class does not exist');
            }
        });
    });

    const passwordClear = user.password;
    const passwordHash = hashedPassword
        ? user.password
        : bcrypt.hashSync(passwordClear, 10);

    user.password = passwordHash;

    return usersCollection
        .insertOne(user)
        .then(() => {
            return true;
        })
        .catch(() => {
            return false;
        });
}
