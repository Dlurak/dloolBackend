import { ObjectId } from 'mongodb';
import { SchoolWithId, schoolsCollection } from './school';

/**
 * Finds one specific school with the given unique name
 * @param uniqueName The unique name of the school to find
 * @returns Either the school with the given unique name or null if no school was found
 */
function findUniqueSchool<T extends boolean = false>(uniqueName: string) {
    type Return = T extends true ? SchoolWithId : SchoolWithId | null;
    return schoolsCollection.findOne({ uniqueName }).then((school) => {
        return school as Return;
    });
}

function findUniqueSchoolById(id: ObjectId) {
    return schoolsCollection.findOne({ _id: id }).then((school) => {
        return school as SchoolWithId | null;
    });
}

/**
 *
 * @param name The name of the school to find, case sensitive and must match exactly, I plan to support RegEx in the future
 * @param timezoneOffsetHours The timezone offset of the school to find in hours
 * @returns An array of schools with the given name and timezone offset
 */
function findSchools(name: string, timezoneOffsetHours: number) {
    return schoolsCollection
        .find({ name, timezoneOffset: timezoneOffsetHours })
        .toArray()
        .then((schools) => {
            return schools as SchoolWithId[];
        });
}

const doesSchoolExist = (uniqueName: string): Promise<boolean> =>
    schoolsCollection.findOne({ uniqueName }).then((sch) => !!sch);

export { findUniqueSchool, findSchools, findUniqueSchoolById, doesSchoolExist };
