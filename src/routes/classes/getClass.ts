import express from 'express';
import { getClassesFromSchool } from '../../database/classes/findClass';
import { findUniqueSchool } from '../../database/school/findSchool';

const router = express.Router();

/**
 * @api {GET} /classes?school=:school Get classes
 * @apiName GEt classes
 * @apiGroup Classes
 * @apiVersion 1.0.0
 *
 * @apiQuery {String} [:school] The name of the school to get the classes from
 *
 * @apiExample {curl} Example usage - curl:
 *   curl http://localhost:3000/classes?school=School
 * @apiExample {python} Example usage - python:
 *   import requests
 *   school = input('School: ')
 *   response = requests.get(f'http://localhost:3000/classes?school={school}')
 *   print(response.json())
 * @apiExample {javascript} Example usage - javascript:
 *   const school = 'School';
 *   const response = await fetch(`http://localhost:3000/classes?school=${school}`);
 *   console.log(await response.json());
 * @apiExample {v} Example usage - v:
 *   import net.http
 *   school := 'School'
 *   resp := http.get('http://localhost:3000/classes?school=${school}')!
 *   println(resp.body)
 *
 * @apiSuccess (200) {String} status The status of the request (success)
 * @apiSuccess (200) {String} message A short message about the status of the request
 * @apiSuccess (200) {Object[]} data The data returned by the request
 * @apiSuccess (200) {String} data._id The MongoDB ID of the class
 * @apiSuccess (200) {String} data.name The name of the class
 * @apiSuccess (200) {String} data.school The MongoDB ID of the school the class is in
 * @apiSuccess (200) {String[]} data.members The MongoDB IDs of the members of the class
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "status": "success",
 *      "message": "Class found",
 *      "data": [
 *        {
 *          "_id": "64bfc63195f139281cec6c75",
 *          "name": "class",
 *          "school": "64bfc62295f139281cec6c74",
 *          "members": [
 *            "64bfc7ae8e3c2ae28caf9662",
 *            "64c01ccabc888e23b18f9f59",
 *            "64c80fa8e0c4a1648da54339"
 *          ]
 *        }
 *      ]
 *    }
 *
 * @apiError (400) {String} status The status of the request (error)
 * @apiError (400) {String} error A short message about the error
 *
 * @apiError (404) {String} status The status of the request (error)
 * @apiError (404) {String} error A short message about the error
 *
 * @apiErrorExample {json} 400 - Missing required query paramter:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Missing required parameter school"
 *    }
 * @apiErrorExample {json} 404 - School not found:
 *    HTTP/1.1 404 Not Found
 *    {
 *       "status": "error",
 *       "message": "School not found"
 *    }
 */
router.get('/', async (req, res) => {
    // this is written like this so it can be easily extended
    const requiredParams = ['school'];
    for (const param of requiredParams) {
        if (!req.query[param]) {
            res.status(400).json({
                status: 'error',
                error: `Missing required parameter ${param}`,
            });
            return;
        }
    }

    const schoolName = req.query.school as string;
    const schoolObj = await findUniqueSchool(schoolName);

    if (!schoolObj) {
        return res.status(404).json({
            status: 'error',
            error: 'School not found',
        });
    }

    const classes = await getClassesFromSchool(schoolObj);

    res.status(200).json({
        status: 'success',
        message: 'Class found',
        data: classes,
    });
});

export default router;
