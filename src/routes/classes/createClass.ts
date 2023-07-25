import { WithId } from 'mongodb';
import { findUniqueSchool } from '../../database/school/findSchool';
import { getUniqueClassById } from '../../database/classes/findClass';
import express from 'express';
import { School } from '../../database/school/school';
import { Class } from '../../database/classes/class';
import { createClass } from '../../database/classes/createClass';

const router = express.Router();

/**
 * @api {post} /classes/ Create a new class
 * @apiName CreateClass
 * @apiGroup Classes
 * @apiVersion  1.0.0
 * @apiDescription Create a new class
 *
 * @apiBody {String} name The name of the class
 * @apiBody {String} school The uniquename of the school the class is in
 *
 * @apiSuccess (201) {String} status Status of the request (success).
 * @apiSuccess (201) {String} message Message of the request (New class created).
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 201 Created
 *   {
 *      "status": "success",
 *      "message": "New class created"
 *   }
 *
 * @apiExample {curl} Curl example:
 *  curl -X POST -H "Content-Type: application/json" -d '{"name": "name", "school": "school"}' http://localhost:3000/classes/
 *
 * @apiError (400) {String} status Status of the request (error).
 * @apiError (400) {String} error Error message.
 *
 * @apiErrorExample {json} 400 - missing key:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "error": "Missing required field: name of type string"
 *    }
 *
 * @apiErrorExample {json} 400 - empty name:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "error": "Name can't be empty"
 *    }
 *
 * @apiErrorExample {json} 400 - school doesn't exist:
 *   HTTP/1.1 400 Bad Request
 *   {
 *      "status": "error",
 *      "error": "School school doesn't exist"
 *   }
 *
 * @apiErrorExample {json} 400 - class already exists:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "error": "Class name already exists in school school"
 *    }
 *
 * @apiError (500) {String} status Status of the request (error).
 * @apiError (500) {String} error Error message.
 *
 * @apiErrorExample {json} 500:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *       "status": "error",
 *       "error": "Failed to create class"
 *    }
 *
 * @apiPermission none
 */
router.post('/', async (req, res) => {
    const body = req.body;

    const requiredFields = {
        name: 'string',
        school: 'string',
    };

    for (const entry of Object.entries(requiredFields)) {
        const key = entry[0];
        const value = entry[1];

        if (typeof body[key] !== value) {
            return res.status(400).json({
                status: 'error',
                error: `Missing required field: ${key} of type ${value}`,
            });
        }
    }

    // check that body.name is not empty
    if (body.name.trim() === '') {
        res.status(400).json({
            status: 'error',
            error: "Name can't be empty",
        });
        return;
    }

    const school = await findUniqueSchool(body.school);
    if (!school) {
        res.status(400).json({
            status: 'error',
            error: `School ${body.school} doesn't exist`,
        });
        return;
    }

    const schoolClasses = (school as WithId<School>).classes;
    for (const classId of schoolClasses) {
        const class_ = await getUniqueClassById(classId);
        if (class_?.name === body.name) {
            res.status(400).json({
                status: 'error',
                error: `Class ${body.name} already exists in school ${body.school}`,
            });
            return;
        }
    }

    const schoolId = (school as WithId<School>)._id;

    const newClass: Class = {
        name: body.name,
        school: schoolId,
        members: [],
    };

    const success = await createClass(newClass);
    if (success) {
        res.status(201).json({
            status: 'success',
            message: `New class ${body.name} created`,
            data: newClass,
        });
        return;
    } else {
        res.status(500).json({
            status: 'error',
            error: 'Failed to create class',
        });
        return;
    }
});

export default router;
