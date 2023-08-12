import express from 'express';
import { findClass } from '../../database/classes/findClass';
import { findUniqueSchool } from '../../database/school/findSchool';

const router = express.Router();

/**
 * @api {GET} /classes/:schoolName/:className Get a specific class
 * @apiName Get specific class
 * @apiGroup Classes
 * @apiVersion 1.0.0
 *
 * @apiParam {String} schoolName The uniquename of the school of the class,
 *    this is case sensitive.
 * @apiParam {String} className The name of the class. All classes are lowercase,
 *    when you use a capital letter it won't find the class.
 *
 * @apiExample {curl} Example usage - curl:
 *    curl http://localhost:3000/Hogwarts/1a
 * @apiExample {python} Example usage - python:
 *    import requests
 *    response = requests.get('http://localhost:3000/Hogwarts/1a')
 *    print(response.json())
 * @apiExample {javascript} Example usage - javascript:
 *    const response = await fetch('http://localhost:3000/Hogwarts/1a');
 *    console.log(await response.json());
 * @apiExample {v} Example usage - v:
 *    import net.http
 *    resp := http.get('http://localhost:3000/Hogwarts/1a')!
 *    println(resp.body)
 *
 * @apiSuccess (200) {String} status The status of the request (success)
 * @apiSuccess (200) {String} message A short message about the status of the request
 * @apiSuccess (200) {Object} data The data returned by the request
 * @apiSuccess (200) {String} data._id The MongoDB ID of the class
 * @apiSuccess (200) {String} data.name The name of the class
 * @apiSuccess (200) {String} data.school The MongoDB ID of the school the class is in
 * @apiSuccess (200) {String[]} data.members The MongoDB IDs of the members of the class
 *
 * @apiError (404) {String} status The status of the request (error)
 * @apiError (404) {String} error A short message about the error
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *        "status": "success",
 *        "message": "Class found",
 *        "data": {
 *            "_id": "64cd3d8b27b7e06ad1d90741",
 *            "name": "class",
 *            "school": "64cd3d2427b7e06ad1d90740",
 *            "members": [
 *                "64cd3d9e27b7e06ad1d90742"
 *            ]
 *        }
 *    }
 * @apiErrorExample {json} 404 - School not found:
 *    HTTP/1.1 404 Not Found
 *    {
 *       "status": "error",
 *       "error": "School not found"
 *    }
 * @apiErrorExample {json} 404 - Class not found:
 *    HTTP/1.1 404 Not Found
 *    {
 *       "status": "error",
 *       "error": "Class not found"
 *    }
 */
router.get('/:schoolname/:classname', async (req, res) => {
    const school = await findUniqueSchool(req.params.schoolname);

    if (!school) {
        return res.status(404).json({
            status: 'error',
            error: 'School not found',
        });
    }

    const classObj = await findClass(school, req.params.classname);

    if (!classObj) {
        return res.status(404).json({
            status: 'error',
            error: 'Class not found',
        });
    }

    return res.status(200).json({
        status: 'success',
        message: 'Class found',
        data: classObj,
    });
});

export default router;
