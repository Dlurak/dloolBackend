import { ObjectId } from 'mongodb';
import { classesCollection } from './class';

function addMember(classId: ObjectId, memberId: ObjectId) {
    classesCollection.findOneAndUpdate(
        { _id: classId },
        {
            $push: { members: memberId },
        },
    );
}

export { addMember as addMemberToClass };
