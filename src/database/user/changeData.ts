import { hashSync } from 'bcrypt';
import { ObjectId } from 'mongodb';
import { usersCollection } from './user';

export async function changeData(
    id: ObjectId,
    options: {
        username?: string;
        name?: string;
        password?: string;
    },
) {
    const update: { $set?: any } = {};

    if (options.username) {
        // check that username is not taken
        const user = await usersCollection.findOne({
            username: options.username,
        });
        if (user) return;

        update.$set = { ...update.$set, username: options.username };
    }
    if (options.name) update.$set = { ...update.$set, name: options.name };
    if (options.password) {
        update.$set = {
            ...update.$set,
            password: hashSync(options.password, 10),
        };
    }

    usersCollection.findOneAndUpdate({ _id: id }, update);
}
