import { ObjectId } from 'mongodb';
import { SchoolWithId } from '../school/school';
import { classesCollection } from './class';
import { findUniqueSchool, findUniqueSchoolById } from '../school/findSchool';

function findClass(school: SchoolWithId, className: string) {
    const schoolId = school._id;

    return classesCollection.findOne({ name: className, school: schoolId });
}

function getClassesFromSchool(school: SchoolWithId) {
    const ids = school.classes;

    const classes = classesCollection.find({ _id: { $in: ids } }).toArray();

    return classes;
}

function getUniqueClassById(id: ObjectId) {
    return classesCollection.findOne({ _id: id }).then((class_) => {
        return class_;
    });
}

async function findClassBySchoolNameAndClassName(
    schoolName: string,
    className: string,
) {
    const schoolObj = await findUniqueSchool(schoolName);
    if (!schoolObj) {
        return null;
    }

    const schoolId = schoolObj._id;
    return classesCollection.findOne({ name: className, school: schoolId });
}

async function getClassAndSchoolNameById(id: ObjectId) {
    const classCollection = await classesCollection.findOne({ _id: id });

    if (!classCollection) {
        return null;
    }

    const schoolId = classCollection.school;
    const school = await findUniqueSchoolById(schoolId);

    if (!school) {
        return null;
    }

    return {
        schoolName: school.name,
        className: classCollection.name,
    };
}

export {
    findClass,
    getClassesFromSchool,
    getUniqueClassById,
    findClassBySchoolNameAndClassName,
    getClassAndSchoolNameById,
};
