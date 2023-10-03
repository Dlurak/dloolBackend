import { ObjectId, Sort } from 'mongodb';
import { getUniqueClassById } from '../classes/findClass';
import { homeworkCollection } from './homework';
import { findUniqueSchoolById } from '../school/findSchool';

export const getFrontendUrlForHomework = async (homeworkId: ObjectId) => {
    const id = homeworkId;
    const homeworkObj = await homeworkCollection.findOne({ _id: id });
    const classId = homeworkObj?.class;
    if (!classId) return null;
    const classObj = await getUniqueClassById(classId);
    const className = classObj?.name;
    const schoolId = classObj?.school;
    if (!schoolId) return null;
    const schoolObj = await findUniqueSchoolById(schoolId);
    const school = schoolObj?.name;
    const pageSize = 15;
    const filter = { class: classId };
    const sort: Sort = {
        'from.year': -1,
        'from.month': -1,
        'from.day': -1,
    };
    let pageNumber: number | null = null;
    const cursor = homeworkCollection.find(filter).sort(sort);
    const totalDocs = await homeworkCollection.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / pageSize);
    for (let page = 1; page <= totalPages; page++) {
        const docsOfPage = await homeworkCollection
            .find(filter)
            .sort(sort)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        const idsOfPage = docsOfPage.map((doc) => doc._id.toString());

        if (idsOfPage.includes(id.toString())) {
            pageNumber = page;
            break;
        }
    }

    return `https://dlool-frontend.vercel.app/homework?page=${pageNumber}&school=${school}&class=${className}#${id}`;
};
