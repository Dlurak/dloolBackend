import findUsername from './findUser';
import { compare } from 'bcrypt';

function checkUsernamePassword(username: string, passwordClear: string) {
    return findUsername(username).then((user) => {
        if (user) {
            // use bcrypt to compare passwordClear with user.password
            return compare(passwordClear, user.password);
        } else {
            // User does not exist
            // TODO: wait a few milliseconds to prevent timing attacks
            return false;
        }
    });
}

export default checkUsernamePassword;
