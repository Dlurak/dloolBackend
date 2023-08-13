import express from 'express';
import {
    getHomeworkForMultipleClasses,
    getHomeworkForUser,
} from '../../../database/homework/findHomework';

import ical, { ICalEventTransparency } from 'ical-generator';
import { findUniqueSchool } from '../../../database/school/findSchool';
import { classesCollection } from '../../../database/classes/class';
import { ObjectId } from 'mongodb';

const router = express.Router();

/**
 * @api {get} /homework/calendar/:school Get homework calendar for a school
 * @apiName GetHomeworkCalendar
 * @apiGroup Homework
 * @apiDescription Get a calendar with all homework for a school in iCal format. IT IS NOT JSON!!!
 * @apiVersion 1.1.0
 *
 * @apiParam {String} school The unique name of the school to get the calendar for
 * @apiQuery {String[]} classes A comma separated list of classes to get the calendar for
 *
 * @apiSuccess (200) {String} The iCal calendar, in text/calendar format <b>NOTE THAT THIS IS NOT JSON!!!</b>
 *
 * @apiError (404) {String} status The status of the response
 * @apiError (404) {String} message The error message
 *
 * @apiErrorExample {json} 404 - School not found:
 *   HTTP/1.1 404 Not Found
 *   {
 *     "status": "error",
 *     "message": "School not found"
 *  }
 * @apiErrorExample {json} 404 - No classes found:
 *   HTTP/1.1 404 Not Found
 *   {
 *     "status": "error",
 *     "message": "No classes found"
 *   }
 */
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
        const class_ = classesCollection
            .findOne({ name: className, school: schoolObj._id })
            .then((class_) => class_?._id ?? null);
        return class_;
    });

    const classIds = (await Promise.all(classIdsPromises)).filter(
        (id) => id !== null,
    );

    if (classIds.length === 0) {
        return res.status(404).json({
            status: 'error',
            message: 'No classes found',
        });
    }

    const homework = await getHomeworkForMultipleClasses(
        classIds as ObjectId[],
    );

    const cal = ical({
        name: 'Homework',
    });

    homework.forEach((hw) => {
        hw.assignments.forEach((assignment) => {
            const dueDate = new Date(
                assignment.due.year,
                assignment.due.month - 1,
                assignment.due.day,
            );
            cal.createEvent({
                start: dueDate,
                end: dueDate,
                allDay: true,

                summary: assignment.subject,
                description: assignment.description,

                transparency: ICalEventTransparency.TRANSPARENT,
            });
        });
    });

    res.set('Content-Type', 'text/calendar');
    res.status(200).send(cal.toString());
});

export default router;
