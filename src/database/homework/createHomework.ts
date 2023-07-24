import { WithId } from 'mongodb';
import { Homework, homeworkCollection } from './homework';

function createHomework(homework: Homework) {
    homework.createdAt = Date.now();

    homeworkCollection
        .find({ class: homework.class, from: homework.from })
        .toArray()
        .then((list) => {
            if (list.length !== 0) {
                throw new Error(
                    'Homework already exists for this class and date',
                );
            }
        });

    return homeworkCollection
        .insertOne(homework)
        .then((value) => {
            return { ...homework, _id: value.insertedId } as WithId<Homework>;
        })
        .catch(() => {
            return null;
        });
}
