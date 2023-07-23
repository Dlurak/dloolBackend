import { ObjectId } from "mongodb";
import { schoolsCollection } from "./school";

function addClass(schoolId: ObjectId,classId: ObjectId) {
    schoolsCollection.findOneAndUpdate({ _id: schoolId }, { 
        $push: { 'classes': classId }
    })
}

export { addClass as addClassToSchool }