import express from 'express';
import authenticate from '../../middleware/auth';
import findUsername from '../../database/user/findUser';
import { findUniqueSchoolById } from '../../database/school/findSchool';
import { findClass } from '../../database/classes/findClass';
import { createHomework } from '../../database/homework/createHomework';
import { WithId } from 'mongodb';
import { Homework } from '../../database/homework/homework';

const router = express.Router();

interface Date {
    year: number;
    month: number;
    day: number;
}

/**
 * @api {post} /homework Create a new homework
 * @apiname CreateHomework
 * @apiGroup Homework
 * @apiVersion 1.0.0
 *
 * @apiBody {Object} from The date it got assigned
 * @apiBody {Number} from.year The year of the date
 * @apiBody {Number} from.month The month of the date
 * @apiBody {Number} from.day The day of the date
 * @apiBody {String} className The name of the class the assignment is for
 * @apiBody {Object[]} assignments A list of all assignments for a given class and date
 * @apiBody {string} assignments.subject The subject of the assignment
 * @apiBody {string} assignments.description The task that should be done
 * @apiBody {Object} assignments.due The date the assignment is due to
 * @apiBody {Number} assignments.due.year The year the assignment is due to
 * @apiBody {Number} assignments.due.month The month the assignment is due to
 * @apiBody {Number} assignments.due.day The day the assignment is due to
 *
 * @apiExample {json} Example usage:
 *    {
 *       "from": {
 *          "year": 2023,
 *          "month": 6,
 *          "day": 27
 *       },
 *       "className": "1a",
 *       "assignments": [
 *          {
 *             "subject": "Math",
 *             "description": "Finish book page 42",
 *             "due": {
 *                "year": 2023,
 *                "month": 12,
 *                "day": 24
 *             }
 *          }
 *       ]
 *    }
 *
 * @apiSuccess (201) {String} status The status of the request (success)
 * @apiSuccess (201) {String} message A short explaination of the request (Homework created)
 * @apiSuccess (201) {Object[]} data The data that was created
 * @apiSuccess (201) {String} data.creator The ID of the user
 * @apiSuccess (201) {String} data.class The ID of the class the homework is for
 * @apiSuccess (201) {Number} data.createdAt The UNIX timestamp in milliseconds when it was created
 *                                           this will be a little after the request was send from
 *                                           the client
 * @apiSuccess (201) {Object} from The date from when this Homework is, it is the same as the from in the request body itself
 * @apiSuccess (201) {Number} from.year
 * @apiSuccess (201) {Number} from.month
 * @apiSuccess (201) {Number} from.day
 * @apiSuccess (201) {Object[]} assignments All the assignments, basically a copy of the request body assignments.
 *                                          They are all explained at the top at request Body
 * @apiSuccess (201) {String} assignments.subject
 * @apiSuccess (201) {String} assignments.description
 * @apiSuccess (201) {Object} assignments.due
 * @apiSuccess (201) {Number} assignments.due.year
 * @apiSuccess (201) {Number} assignments.due.month
 * @apiSuccess (201) {Number} assignments.due.day
 *
 * @apiError (400) {String} status The status of the request (error)
 * @apiError (400) {String} message A short explaination of the error
 *
 * @apiError (500) {String} status The status of the request (error)
 * @apiError (500) {String} message A short explaination of the error
 * @apiError (500) {String} [hint] A hint to solve the problem
 *
 * @apiErrorExample {json} 400 - missing key:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Missing required fields"
 *    }
 * @apiErrorExample {json} 400 - Invalid from date:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Invalid from date"
 *    }
 * @apiErrorExample {json} 400 - Assignments must be of type array:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Assignments must be of type array"
 *    }
 * @apiErrorExample {json} 400 - Assignments must not be empty:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Assignments must not be empty"
 *    }
 * @apiErrorExample {json} 400 - Missing required fields for assignment
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Missing required fields for assignment 42"
 *    }
 * @apiErrorExample {json} 400 - Invalid fields for assignments
 * HTTP/1.1 400 Bad Request
 * {
 *    "status": "error",
 *    "message": "Invalid fields for assignment 42"
 * }
 *
 * @apiErrorExample {json} 400 - Invalid due date
 * HTTP/1.1 400 Bad Request
 *    "status": "error",
 * {
 *    "message": "Bad Request"
 * }
 *
 * @apiErrorExample {json} 400 - Class not found
 * HTTP/1.1 400 Bad Request
 * {
 *    "status": "error",
 *    "message": "Class not found"
 * }
 * @apiErrorExample {json} 500 - User could not be found
 * HTTP/1.1 500 Internal server error
 * {
 *    "status": "error",
 *    "message": "Internal server error, user could not be found"
 * }
 * @apiErrorExample {json} 500 - School could not be found
 *    HTTP/1.1 500 Internal server error
 *    {
 *       "status": "error",
 *       "message": "Internal server error, school of user could not be found"
 *    }
 * @apiErrorExample {json} 500 - Homework could not be created
 *    HTTP/1.1 500 Internal server error
 *    {
 *       "status": "error",
 *       "message": "Internal server error, homework could not be created",
 *       "hint": "Maybe there is already a homework for the given class and date?"
 *    }
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *    {
 *       "status": "success",
 *       "message": "Homework created",
 *       "data": [
 *          {
 *             "creator": "MongoDB Object ID",
 *             "class": "MongoDB Object ID",
 *             "createdAt": 0,
 *             "assignments": [
 *                "subject": "Math",
 *                "description": "Finish book page 42",
 *                "due": {
 *                   "year": 2023,
 *                   "month": 6,
 *                   "day": 27
 *                }
 *             ]
 *          }
 *       ]
 *    }
 *
 *
 * @apiUse jwtAuth
 */
router.post('/', authenticate, async (req, res) => {
    const body = req.body;
    let buildHomework: any = {};

    // check that body has assignments
    const { from, assignments, className } = body;
    if (!from || !assignments || !className) {
        res.status(400).json({
            status: 'error',
            message: 'Missing required fields',
        });
        return;
    }

    if (!isDateValid(from)) {
        res.status(400).json({
            status: 'error',
            message: 'Invalid from date',
        });
        return;
    }

    buildHomework = {
        from: sortDate(from),
        assignments: [],
    };

    if (!Array.isArray(assignments)) {
        res.status(400).json({
            status: 'error',
            message: 'Assignments must be of type array',
        });
        return;
    } else if (assignments.length === 0) {
        res.status(400).json({
            status: 'error',
            message: 'Assignments must not be empty',
        });
        return;
    }

    let assignmentIndex = 0;
    for (const assignment of assignments) {
        // check for subject: string description: string and due: some format as from but it must not be the same date as from
        const { subject, description, due } = assignment;

        if (!subject || !description || !due) {
            res.status(400).json({
                status: 'error',
                message: `Missing required fields for assignment ${assignmentIndex}`,
            });
            return;
        }

        if (typeof subject !== 'string' || typeof description !== 'string') {
            res.status(400).json({
                status: 'error',
                message: `Invalid fields for assignment ${assignmentIndex}`,
            });
            return;
        }

        if (!isDateValid(due)) {
            res.status(400).json({
                status: 'error',
                message: `Invalid due date for assignment ${assignmentIndex}`,
            });
            return;
        }

        const newAssignment = {
            subject,
            description,
            due: sortDate(due),
        };

        buildHomework.assignments.push(newAssignment);

        assignmentIndex++;
    }

    // BASIC VALIDATION DONE

    const username = res.locals.jwtPayload.username as string;
    const user = await findUsername(username);

    if (!user) {
        res.status(500).json({
            status: 'error',
            message: 'Internal server error, user could not be found',
        });
        return;
    }

    const schoolOfUser = await findUniqueSchoolById(user.school);

    if (!schoolOfUser) {
        res.status(500).json({
            status: 'error',
            message: 'Internal server error, school of user could not be found',
        });
        return;
    }

    const classOfHomework = await findClass(schoolOfUser, className);
    if (!classOfHomework) {
        res.status(400).json({
            status: 'error',
            message: 'Class not found',
        });
        return;
    }

    buildHomework.class = classOfHomework._id;
    buildHomework.creator = user._id;
    buildHomework.createdAt = Date.now();

    let data: WithId<Homework>;

    return createHomework(buildHomework).then((homework) => {
        if (!homework) {
            res.status(500).json({
                status: 'error',
                error: 'Internal server error, homework could not be created',
                hint: 'Maybe there is already a homework for the given class and date?',
            });
            return;
        } else {
            data = homework;
        }

        res.status(201).json({
            status: 'success',
            message: 'Homework created',
            data,
        });
        return;
    });
});

function isDateValid(date: Date) {
    const { year, month, day } = date;

    if (
        typeof year !== 'number' ||
        typeof month !== 'number' ||
        typeof day !== 'number'
    ) {
        return false;
    }

    if (month < 1 || month > 12) {
        return false;
    }

    if (day < 1 || day > 31) {
        return false;
    }

    return true;
}

function sortDate(date: Date) {
    const { year, month, day } = date;

    return {
        year,
        month,
        day,
    };
}

export default router;
