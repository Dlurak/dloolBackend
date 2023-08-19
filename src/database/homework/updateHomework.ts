import { ObjectId } from 'mongodb';
import { Homework, homeworkCollection } from './homework';

export async function updateHomework(id: ObjectId, options: Homework) {
    let newHomework = options;

    await homeworkCollection.findOneAndReplace({ _id: id }, newHomework);
    return newHomework;
}
