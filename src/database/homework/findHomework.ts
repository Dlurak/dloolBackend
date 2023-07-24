import { ObjectId } from 'mongodb';
import { homeworkCollection } from './homework'

function getHomeworkByClass(classId: ObjectId) {
    return homeworkCollection.find({ class: classId }).toArray();
}

function getHomeworkByCreator(creatorId: ObjectId) {
    return homeworkCollection.find({ creator: creatorId }).toArray();
}

async function getNewestHomeworkFromClass(classId: ObjectId) {
    const objects = homeworkCollection.aggregate([
        {
            $addFields: {
                "date": {
                    $dateFromParts: {
                        year: "$from.year",
                        month: "$from.month",
                        day: "$from.day"
                    }
                }
            }
        },
        {
            $match: {
                class: classId
            }
        },
        {
            "$sort": {
                date: -1
            }
        }
    ]).toArray();
    
    return objects.then((obj) => {
        return obj.slice(0, 1)[0];
    });
}

