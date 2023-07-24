import { addClassToSchool } from '../school/update';
import { Class, classesCollection } from './class';

export function createClass(classObj: Class): Promise<boolean> {
    // 1. add the class to the db

    return classesCollection
        .insertOne(classObj)
        .then((newClass) => {
            const newClassId = newClass.insertedId;
            const schoolId = classObj.school;

            // 2. add the class to the school
            addClassToSchool(schoolId, newClassId);
            return true;
        })
        .catch(() => {
            return false;
        });
}
