import { findUniqueSchool } from '../../database/school/findSchool';
import { findClass } from '../../database/classes/findClass';
import express from 'express';
import { getHomeworkByClass } from '../../database/homework/findHomework';
import { z } from 'zod';
import { generateIcal } from './calendar/generateIcal';

const router = express.Router();

/**
 * @api {GET} /homework/all?class=:class&school=:school Get all homework
 * @apiName Get all homework
 * @apiGroup Homework
 * @apiVersion  1.0.0
 *
 * @apiQuery {String} :class The name of the class
 * @apiQuery {String} :school The name of the school
 *
 * @apiError (400) {String} status The status of the request (error)
 * @apiError (400) {String} message A short explaination of the error
 *
 * @apiErrorExample {json} 400 - Missing query parameter:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "No class was given"
 *    }
 * @apiErrorExample {json} 400 - The school doesn't exist:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "The school Hogwarts does not exist"
 *    }
 * @apiErrorExample {json} 400 - The class doesn't exist:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "The class 1a does not exist in the school Hogwarts"
 *    }
 *
 *
 * @apiSuccess (200) {String} status A status (success)
 * @apiSuccess (200) {String} message A short explaination (Homework found)
 * @apiSuccess (200) {Object[]} data The actual data
 * @apiSuccess (200) {String} data.creator The MongoDB ID of the creator of that homework
 * @apiSuccess (200) {String} data.class The MongoDB ID of the class that homework is for
 * @apiSuccess (200) {Number} data.createdAt The UNIX timestamp in milliseconds at which the homework was added to the system
 * @apiSuccess (200) {Object} data.from The date the homework is from
 * @apiSuccess (200) {Number} data.from.year The year the homework is from
 * @apiSuccess (200) {Number} data.from.month
 * @apiSuccess (200) {Number} data.from.day
 * @apiSuccess (200) {Object[]} data.assignments The assignments for the given date
 * @apiSuccess (200) {String} data.assignments.subject The subject of the assignment, e.g. math
 * @apiSuccess (200) {String} data.assignments.description A short explanation what the task is
 * @apiSuccess (200) {Object} data.assignments.due The date the assignment is due to
 * @apiSuccess (200) {Number} data.assignments.due.year
 * @apiSuccess (200) {Number} data.assignments.due.month
 * @apiSuccess (200) {Number} data.assignments.due.day
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 Success
 *    {
 *       "status": "success",
 *       "message": "Homework found",
 *       "data": [
 *          {
 *             "creator": "MongoDB ObjectID",
 *             "class": "MongoDB ObjectID",
 *             "createdAt": 0,
 *             "from": {
 *                "year": 2023,
 *                "month": 6,
 *                "day": 28
 *             },
 *             "assignments": [
 *                "subject": "Math",
 *                "descirption": "Book page 2",
 *                "due": {
 *                   "year": 2023,
 *                   "month": 7,
 *                   "day": 28
 *                }
 *             ]
 *          }
 *       ]
 *    }
 */
router.get('/', async (req, res) => {
    const genErrorMessages = (keyname: string, type = 'string') => ({
        invalid_type_error: `Expected ${keyname} to be of type ${type}`,
        required_error: `No ${keyname} was given`,
    });

    const schema = z.object({
        class: z.string(genErrorMessages('class')),
        school: z.string(genErrorMessages('school')),
    });

    const result = schema.safeParse(req.query);

    if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;

        const errors = Object.values(fieldErrors);
        const flatErrors = errors.reduce((acc, val) => acc.concat(val), []);

        res.status(400).json({
            status: 'error',
            message: flatErrors[0],
            errors: fieldErrors,
        });
        return;
    }

    const className = result.data.class;
    const schoolName = result.data.school;

    const school = await findUniqueSchool(schoolName);
    if (!school) {
        res.status(400).json({
            status: 'error',
            message: `The school ${schoolName} does not exist`,
        });
        return;
    }

    const classObj = await findClass(school, className);

    if (!classObj) {
        res.status(400).json({
            status: 'error',
            message: `The class ${className} does not exist in the school ${schoolName}`,
        });
        return;
    }

    const homework = await getHomeworkByClass(classObj._id);

    res.format({
        'application/json': () => {
            res.status(200).json({
                status: 'success',
                message: 'Homework found',
                data: homework,
            });
            return;
        },
        // ical
        'text/calendar': async () => {
            const cal = await generateIcal(schoolName, [className]);
            if (!cal) {
                res.status(500).json({
                    status: 'error',
                    message: 'Internal server error',
                });
                return;
            }
            res.status(200)
                .setHeader('Content-Type', 'text/calendar')
                .send(cal.toString());
        },

        default: () => {
            res.status(200).json({
                status: 'success',
                message: 'Homework found',
                data: homework,
            });
            return;
        },
    });
});

export default router;
