import { ObjectId } from 'mongodb';
import { usersCollection } from './user';
import { Class, classesCollection } from '../classes/class';

export function deleteUser(id: ObjectId) {
    usersCollection.findOne({ _id: id }).then((user) => {
        if (!user) return;
        user.classes.forEach((c: Class) => {
            classesCollection.findOneAndUpdate(
                { _id: c },
                {
                    $pull: { members: id },
                },
            );
        });
    });

    usersCollection.findOneAndDelete({ _id: id });
}
