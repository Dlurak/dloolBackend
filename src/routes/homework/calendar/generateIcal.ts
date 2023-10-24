import { ObjectId } from 'mongodb';
import { classesCollection } from '../../../database/classes/class';
import { getHomeworkForMultipleClasses } from '../../../database/homework/findHomework';
import { findUniqueSchool } from '../../../database/school/findSchool';
import ical, { ICalEventTransparency } from 'ical-generator';
import { getFrontendUrlForHomework } from '../../../database/homework/getFrontendUrlForHomework';

export const generateIcal = async (school: string, classes: string[]) => {
    const schoolObj = await findUniqueSchool(school);
    if (!schoolObj) return null;

    const classIdsPromises = classes.map((className: string) => {
        const class_ = classesCollection
            .findOne({ name: className, school: schoolObj._id })
            .then((class_) => class_?._id ?? null);
        return class_;
    });

    const classIds = (await Promise.all(classIdsPromises)).filter(
        (id) => id !== null,
    );

    if (classIds.length === 0) return null;

    const homework = await getHomeworkForMultipleClasses(
        classIds as ObjectId[],
    );

    const cal = ical({
        name: 'Homework',
    });

    const homeworkIds = homework.map((hw) => hw._id);
    const frontendUrlsPromises = homeworkIds.map((id) =>
        getFrontendUrlForHomework(id),
    );
    const frontendUrls = await Promise.all(frontendUrlsPromises);

    let i = 0;
    homework.forEach((hw) => {
        const url = frontendUrls[i];
        i++;
        hw.assignments.forEach((assignment) => {
            const dueDate = new Date(
                assignment.due.year,
                assignment.due.month - 1,
                assignment.due.day,
            );

            const description = `${assignment.description}\n\nDlool - Your colloborative homework manager`;

            cal.createEvent({
                start: dueDate,
                end: dueDate,
                allDay: true,

                summary: assignment.subject,
                description: description,

                url: url,

                transparency: ICalEventTransparency.TRANSPARENT,
            });
        });
    });

    return cal;
};
