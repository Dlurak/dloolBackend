import express from 'express';
import { timezoneOffsets } from '../../constant/constants';
import { findUniqueSchool } from '../../database/school/findSchool';
import { createSchool } from '../../database/school/createSchool';

const router = express.Router();

/**
 *
 * @api {POST} /school Create School
 * @apiName createSchool
 * @apiGroup Schools
 * @apiVersion  1.0.0
 * @apiDescription Create a new School
 *
 * @apiBody {String} name The name of the new school
 * @apiBody {String} description A short description of the school so it is clear to others which exact school it is. So things like the city would be good.
 * @apiBody {String} uniqueName A unique name for the school no other school can already have this name
 * @apiBody {Number} timezoneOffset The timezone offset isn't actually used. So it will be probably be optional in a future version.
 *
 * @apiExample {json} Example-Body:
 *    {
 *       "name": "Hogwarts"
 *       "description": "This is the real Hogwarts"
 *       "uniqueName": "hogwarts"
 *       "timezoneOffset": 0
 *    }
 *
 * @apiSuccess (201) status The status of the request
 * @apiSuccess (201) message A short explaination
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *    {
 *       "status": "Success",
 *       "message": "School created successfully"
 *    }
 *
 * @apiError (400) {String} status The status of the request
 * @apiError (400) {String} message A short explaination of the error
 *
 * @apiError (500) {String} status The status of the request
 * @apiError (500) {String} message A short explaination of the error
 *
 * @apiErrorExample {json} 400 - Missing key:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Missing required field: name of type string"
 *    }
 * @apiErrorExample {json} 400 - Invalid timezone:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Invalid timezone offset: 42"
 *    }
 * @apiErrorExample {json} 400 - School already exists:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "School with unique name Hogwarts already exists"
 *    }
 * @apiErrorExample {json} 500 - Failed to create school:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *       "status": "error",
 *       "message": "Failed to create school"
 *    }
 *
 * @apiPermission None
 */
router.post('/', async (req, res) => {
    const body = req.body;

    const requiredFields = {
        name: 'string',
        description: 'string',
        uniqueName: 'string',
        timezoneOffset: 'number',
    };

    for (const entry of Object.entries(requiredFields)) {
        const key = entry[0];
        const value = entry[1];

        if (typeof body[key] !== value) {
            return res.status(400).json({
                status: 'error',
                message: `Missing required field: ${key} of type ${value}`,
            });
        }
    }

    // check if the timezone offset is valid

    if (!timezoneOffsets.includes(body.timezoneOffset)) {
        return res.status(400).json({
            status: 'error',
            message: `Invalid timezone offset: ${body.timezoneOffset}`,
        });
    }

    // check if the uniqueName is really unique
    let uniqueSchool = await findUniqueSchool(body.uniqueName);

    if (uniqueSchool) {
        return res.status(400).json({
            status: 'error',
            message: `School with unique name ${body.uniqueName} already exists`,
        });
    }

    createSchool({
        name: body.name,
        description: body.description,
        uniqueName: body.uniqueName,
        timezoneOffset: body.timezoneOffset,
        classes: [],
    })
        .then((success) => {
            if (success) {
                return res.status(201).json({
                    status: 'success',
                    message: 'School created successfully',
                });
            } else {
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to create school',
                });
            }
        })
        .catch(() => {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to create school',
            });
        });
});

export default router;
