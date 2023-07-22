import { ObjectId } from 'mongodb';
import { User, usersCollection } from './user';

type userSearchOptions =
    | {
          name: string;
          school: string;
          class: string;
      }
    | {
          id: ObjectId;
      };

/**
 * A function to check if a user exists
 * @param options The search options to find a user
 * @returns A boolean indicating whether the user exists
 */
async function doesUserExist(options: userSearchOptions): Promise<boolean> {
    const exists = usersCollection.findOne(options).then((user) => {
        return user !== null;
    });

    return exists;
}

export default doesUserExist;
