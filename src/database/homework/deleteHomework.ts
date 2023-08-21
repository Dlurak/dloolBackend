import { ObjectId } from 'mongodb';
import { homeworkCollection } from './homework';

export async function deleteHomework(id: ObjectId) {
    return (await homeworkCollection.findOneAndDelete({ _id: id })).value;
}
