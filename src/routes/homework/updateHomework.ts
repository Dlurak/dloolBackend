import express from 'express';
import { updateHomework } from '../../database/homework/updateHomework';
import authenticate from '../../middleware/auth';
import findUsername from '../../database/user/findUser';
import { Homework, homeworkCollection } from '../../database/homework/homework';
import { ObjectId } from 'mongodb';
import { isDateValid, sortDate } from '../../utils/date';

const router = express.Router();

/**
 * @api {put} /homework/:id Update homework
 * @apiName UpdateHomework
 * @apiGroup Homework
 * @apiDescription Update homework
 *
 * @apiParam {String} id MongoDB ObjectID of the homework
 * @apiBody {Object} from Homework from date
 * @apiBody {Number} from.year Year
 * @apiBody {Number} from.month Month
 * @apiBody {Number} from.day Day
 * @apiBody {Object[]} assignments Homework assignments
 * @apiBody {String} assignments.subject Subject
 * @apiBody {String} assignments.description Description of the assignment
 * @apiBody {Object} assignments.due Due date of the assignment
 * @apiBody {Number} assignments.due.year Year of the assignment
 * @apiBody {Number} assignments.due.month Month of the assignment
 * @apiBody {Number} assignments.due.day Day of the assignment
 *
 * @apiExample {curl} Curl example:
 *    curl -X PUT -H "Content-Type: application/json" -d '{"from": {"year": 2023, "month": 8, "day": 19}, "assignments": [{"subject": "Math", "description": "Do the math homework", "due": {"year": 2023, "month": 8, "day": 19}}]}' http://localhost:3000/homework/6120b0b0b4b7c4b4b4b4b4b4
 *
 * @apiExample {javascript} JavaScript example:
 *    const data = {
 *        "from": {
 *            "month": 5,
 *            "year": 2021,
 *            "day": 1
 *        },
 *        "assignments": [
 *            {
 *                "subject": "Math",
 *                "description": "Do the homework",
 *                "due": {
 *                    "year": 2021,
 *                    "month": 5,
 *                    "day": 2
 *                }
 *            }
 *        ]
 *    };
 *
 *    const res = await fetch('http://localhost:3000/homework/6120b0b0b4b7c4b4b4b4b4b4', {
 *        method: 'PUT',
 *        body: JSON.stringify(data),
 *        headers: {
 *            'Content-Type': 'application/json'
 *        }
 *    });
 *    const fetchedData = await res.json();
 *    console.log(fetchedData);
 *
 * @apiExample {Python} Python example
 *    import requests
 *    data = {
 *        "from": {
 *            "month": 5,
 *            "year": 2021,
 *            "day": 1
 *        },
 *        "assignments": [
 *            {
 *                "subject": "Math",
 *                "description": "Do the homework",
 *                "due": {
 *                    "year": 2021,
 *                    "month": 5,
 *                    "day": 2
 *                }
 *            }
 *        ]
 *    }
 *    res = requests.put('http://localhost:3000/homework/6120b0b0b4b7c4b4b4b4b4b4', json=data)
 *    print(res.json())
 *
 * @apiSuccess (200) {String} status The status of the request
 * @apiSuccess (200) {String} message The message of the request
 * @apiSuccess (200) {Object} data The updated homework
 * @apiSuccess (200) {Object} data.from Homework from date
 * @apiSuccess (200) {Number} data.from.year Year
 * @apiSuccess (200) {Number} data.from.month Month
 * @apiSuccess (200) {Number} data.from.day Day
 * @apiSuccess (200) {Object[]} data.assignments Homework assignments
 * @apiSuccess (200) {String} data.assignments.subject Subject of the assignment
 * @apiSuccess (200) {String} data.assignments.description Description of the assignment
 * @apiSuccess (200) {Object} data.assignments.due Due date of the assignment
 * @apiSuccess (200) {Number} data.assignments.due.year Year of the assignment
 * @apiSuccess (200) {Number} data.assignments.due.month Month of the assignment
 * @apiSuccess (200) {Number} data.assignments.due.day Day of the assignment
 * @apiSuccess (200) {String} data.class MongoDB ObjectID of the class
 * @apiSuccess (200) {String} data.creator MongoDB ObjectID of the creator
 * @apiSuccess (200) {Number} data.createdAt Timestamp of the creation date
 *
 * @apiError (400) {String} status The status of the request
 * @apiError (400) {String} message The message of the request
 *
 * @apiError (404) {String} status The status of the request
 * @apiError (404) {String} message The message of the request
 *
 * @apiError (500) {String} status The status of the request
 * @apiError (500) {String} message The message of the request
 *
 * @apiErrorExample {json} 400 Invalid homework ID
 *    HTTP/1.1 400 Bad Request
 *    X-Powered-By: Express
 *    Access-Control-Allow-Origin: *
 *    Content-Type: application/json; charset=utf-8
 *    Content-Length: 50
 *    ETag: W/"32-Qb3jIZDhZi8m7T8r1oIUufPqTZc"
 *    Date: Sat, 19 Aug 2023 08:26:07 GMT
 *    Connection: close
 *
 *    {
 *      "status": "error",
 *      "message": "Invalid homework ID"
 *    }
 *
 * @apiErrorExample {json} 404 Homework not found
 *    HTTP/1.1 404 Not Found
 *    X-Powered-By: Express
 *    Access-Control-Allow-Origin: *
 *    Content-Type: application/json; charset=utf-8
 *    Content-Length: 49
 *    ETag: W/"31-Nom76KIznqfFwuLQMhdn8bW+7nk"
 *    Date: Sat, 19 Aug 2023 08:28:57 GMT
 *    Connection: close
 *
 *    {
 *      "status": "error",
 *      "message": "Homework not found"
 *    }
 *
 * @apiErrorExample {json} 400 Invalid "from" field
 *    {
 *        status: 'error',
 *        message: 'Invalid "from" field'
 *    }
 *
 * @apiErrorExample {json} 400 - Missing "assignments" field:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Missing \"assignments\" field"
 *    }
 *
 * @apiErrorExample {json} 400 - Invalid "assignments" field:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Invalid \"assignments\" field"
 *    }
 *
 * @apiErrorExample {json} 400 - Invalid "subject" or "description" field:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Invalid \"subject\" or \"description\" field"
 *    }
 *
 * @apiErrorExample {json} 400 - Invalid "due" field:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Invalid \"due\" field"
 *    }
 *
 * @apiErrorExample {json} 500 - Internal server error:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *       "status": "error",
 *       "message": "Internal server error"
 *    }
 *
 * @apiUse jwtAuth
 */
router.put('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const createdAt = new Date().getTime();
    const username = res.locals.jwtPayload.username;
    const userIdPromise = findUsername(username).then((u) => u?._id);

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid homework ID',
        });
    }

    const oldHomework = await homeworkCollection.findOne({
        _id: new ObjectId(id),
    });

    if (!oldHomework) {
        return res.status(404).json({
            status: 'error',
            message: 'Homework not found',
        });
    }

    const classId = oldHomework.class;

    const { from, assignments } = req.body;

    //--//--// VALIDATION //--//--//

    if (!isDateValid(from)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid "from" field',
        });
    }

    if (!assignments) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing "assignments" field',
        });
    }

    if (!Array.isArray(assignments)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid "assignments" field',
        });
    }

    for (const assignment of assignments) {
        const { subject, description, due } = assignment;

        const subjectDescriptionTypes = [typeof subject, typeof description];

        const subjectDescriptionValid = subjectDescriptionTypes.every(
            (type) => type === 'string',
        );

        if (!subjectDescriptionValid) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid "subject" or "description" field',
            });
        }

        if (!isDateValid(due)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid "due" field',
            });
        }
    }

    const userId = await userIdPromise;
    if (!userId) {
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }

    //--//--// UPDATING //--//--//

    const newHomework: Homework = {
        from: sortDate(from),
        assignments: assignments.map((assignment) => {
            return {
                subject: assignment.subject,
                description: assignment.description,
                due: sortDate(assignment.due),
            };
        }),
        class: classId,
        creator: userId,
        createdAt,
    };

    updateHomework(new ObjectId(id), newHomework);

    res.status(200).json({
        status: 'success',
        message: 'Homework updated',
        data: newHomework,
    });
});

export default router;
