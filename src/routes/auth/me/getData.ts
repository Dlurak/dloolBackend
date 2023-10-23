import { findUniqueSchoolById } from '../../../database/school/findSchool';
import findUsername from '../../../database/user/findUser';
import { getUniqueClassById } from '../../../database/classes/findClass';
import express from 'express';
import authenticate from '../../../middleware/auth';

const router = express.Router();

/**
 * @api {get} /auth/me Get information about the current user
 * @apiname GetOwnData
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiDescription Get information about the currently logged in user
 *
 * @apiSuccess (200) {String} status A short status of the request (success)
 * @apiSuccess (200) {String} message A short explaination of the response
 * @apiSuccess (200) {Object} data An object containing the data about the user
 * @apiSuccess (200) {String} data.id The MongoDB id of the user
 * @apiSuccess (200) {String} data.username The unique username of the user
 * @apiSuccess (200) {String} data.name The show name of the user
 * @apiSuccess (200) {String|Null} data.email The email of the user
 * @apiSuccess (200) {Object} data.school The school the user is in
 * @apiSuccess (200) {String} data.school._id The MongoDB id of the school
 * @apiSuccess (200) {String} data.school.name The name of the school
 * @apiSuccess (200) {String} data.school.description The short description of the school
 * @apiSuccess (200) {String} data.school.uniqueName The unique name of the school
 * @apiSuccess (200) {Number} data.school.timezoneOffset This is a value that doesn't have any use but still exists
 * @apiSuccess (200) {String[]} data.school.classes All the MongoDB IDs of the classes that are part of the school
 * @apiSuccess (200) {Object[]} data.classes A list of all the classes the user is in
 * @apiSuccess (200) {String} data.classes._id The MongoDB Id of the class
 * @apiSuccess (200) {String} data.classes.name The name of the class
 * @apiSuccess (200) {String} data.classes.school The MongoDB ID of the school
 * @apiSuccess (200) {String[]} data.classes.members A list of all the MongoDB IDs of the members of a class including the ID of the requestor self
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    X-Powered-By: Express
 *    Access-Control-Allow-Origin: *
 *    Content-Type: application/json; charset=utf-8
 *    Content-Length: 538
 *    ETag: W/"21a-yV9CzJWdoBJXHCwymV4bFKpCjJY"
 *    Date: Thu, 03 Aug 2023 14:05:38 GMT
 *    Connection: close
 *
 *    {
 *      "status": "success",
 *      "message": "successfully send data",
 *      "data": {
 *        "id": "64bfc7ae8e3c2ae28caf9662",
 *        "username": "dlurak",
 *        "name": "Dlurak",
 *        "email": null,
 *        "school": {
 *        },
 *        "classes": [
 *          {
 *            "_id": "64bfc63195f139281cec6c75",
 *            "name": "class",
 *            "school": "64bfc62295f139281cec6c74",
 *            "members": [
 *              "64bfc7ae8e3c2ae28caf9662",
 *              "64c01ccabc888e23b18f9f59",
 *              "64c80fa8e0c4a1648da54339"
 *            ]
 *          }
 *        ]
 *      }
 *    }
 *
 * @apiError (500) {String} status The status of the request (error)
 * @apiError (500) {String} error Could not find user
 *
 * @apiErrorExample {json} 500 - User could not be found:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *       "status": "error",
 *       "error": "Could not find user"
 *    }
 *
 * @apiUse jwtAuth
 */
router.get('/', authenticate, async (req, res) => {
    const rawData = await findUsername(res.locals.jwtPayload.username);

    if (rawData === null) {
        return res.status(500).json({
            status: 'error',
            error: 'Could not find user',
        });
    }

    const school = await findUniqueSchoolById(rawData.school);
    const classes = await Promise.all(
        rawData.classes.map(async (c) => await getUniqueClassById(c)),
    );

    const data = {
        id: rawData._id,
        username: rawData.username,
        name: rawData.name,
        email: rawData.email,
        school,
        classes,
    };

    res.status(200).json({
        status: 'success',
        message: 'successfully send data',
        data,
    });
});

export default router;
