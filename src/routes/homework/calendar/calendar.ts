import express from 'express';
import { getHomeworkForMultipleClasses, getHomeworkForUser } from '../../../database/homework/findHomework';

import ical, { ICalEventTransparency } from 'ical-generator';
import { findUniqueSchool } from '../../../database/school/findSchool';
import { classesCollection } from '../../../database/classes/class';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.get('/calendar/:school', async (req, res) => {
    const school = req.params.school;
    const rawClasses = req.query.classes;
    const classes = rawClasses ? (rawClasses as string).split(',') : [];

    const schoolObj = await findUniqueSchool(school);

    if (!schoolObj) {
        return res.status(404).json({
            status: 'error',
            message: 'School not found',
        });
    }

    const classIdsPromises = classes.map((className: string) => {
        const class_ = classesCollection.findOne({ name: className, school: schoolObj._id }).then((class_) => class_?._id ?? null);
        return class_
    });

    const classIds = (await Promise.all(classIdsPromises)).filter((id) => id !== null);

    if (classIds.length === 0) {
        return res.status(404).json({
            status: 'error',
            message: 'No classes found',
        });
    }

    const homework = await getHomeworkForMultipleClasses(classIds as ObjectId[]);

    const cal = ical({
        name: 'Homework',
    });

    homework.forEach((hw) => {
        hw.assignments.forEach((assignment) => {
            const dueDate = new Date(assignment.due.year, assignment.due.month - 1, assignment.due.day);
            cal.createEvent({
                start: dueDate,
                end: dueDate,
                allDay: true,

                summary: assignment.subject,
                description: assignment.description,

                transparency: ICalEventTransparency.TRANSPARENT
            })
        });
    })
    
    res.set('Content-Type', 'text/calendar');
    res.status(200).send(cal.toString())
});

export default router;
