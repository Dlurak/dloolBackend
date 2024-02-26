import { homeworkCollection } from '../database/homework/homework';

(async () => {
    const allHomework = await homeworkCollection.find().toArray();

    for (const hw of allHomework) {
        homeworkCollection.updateOne(
            { _id: hw._id },
            { $set: { contributors: [hw.creator] } },
        );
    }
})();
