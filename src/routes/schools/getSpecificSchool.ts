import express from 'express'
import { findUniqueSchool } from '../../database/school/findSchool'

const router = express.Router()

/**
 * @api {GET} /schools/:schoolname Get a specific school
 * @apiName Get a specific school
 * @apiGroup Schools
 * @apiVersion  1.0.0
 * @apiDescription Returns details of a specific school
 * 
 * @apiParam  {String} schoolname The unique name of the school to get
 * 
 * @apiExample {curl} Example usage - curl:
 *    curl http://localhost:3000/schools/school
 * @apiExample {python} Example usage - python:
 *    import requests
 *    school_name = input('School name: ')
 *    response = requests.get(f'http://localhost:3000/schools/{school_name}')
 *    print(response.json())
 * @apiExample {javascript} Example usage - javascript:
 *    const schoolName = 'school';
 *    const res = await fetch(`http://localhost:3000/schools/${schoolName}`);
 *    console.log(await res.json());
 * @apiExample {v} Example usage - v:
 *    import net.http
 *    school_name := 'school'
 *    resp := http.get('http://localhost:3000/schools/${school_name}')!
 *    println(resp.body)
 * 
 * @apiSuccess (200) {String} status The status of the request (success)
 * @apiSuccess (200) {String} message A short message about the status of the request
 * @apiSuccess (200) {Object} data The data returned by the request
 * @apiSuccess (200) {String} data._id The MongoDB ID of the school
 * @apiSuccess (200) {String} data.name The name of the school
 * @apiSuccess (200) {String} data.description The description of the school
 * @apiSuccess (200) {String} data.uniqueName The unique name of the school
 * @apiSuccess (200) {Number} data.timezoneOffset The offset of the school's timezone in hours. This value isn't used anywhere but is still mendatory
 * @apiSuccess (200) {String[]} data.classes The MongoDB IDs of the classes in the school
 * 
 * @apiError (404) {String} status The status of the request (error)
 * @apiError (404) {String} message A short message about the status of the request
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *    {
 *       "status": "success",
 *       "message": "School found",
 *       "data": {
 *          "_id": "64cd3d2427b7e06ad1d90740",
 *          "name": "School",
 *          "description": "This school does not exist it is only for testing purposes",
 *          "uniqueName": "school",
 *          "timezoneOffset": 0,
 *          "classes": [
 *             "64cd3d8b27b7e06ad1d90741"
 *          ]
 *       }
 *    }
 * @apiErrorExample {json} 404 - School not found:
 *    HTTP/1.1 404 Not Found
 *    {
 *       "status": "error",
 *       "error": "School not found"
 *    }
 */
router.get('/:schoolname', async (req, res) => {
    const schoolName = req.params.schoolname

    const school = await findUniqueSchool(schoolName)


    if (!school) {
        return res.status(404).json({
            status: 'error',
            error: 'School not found'
        })
    }


    res.status(200).json({
        status: 'success',
        message: 'School found',
        data: school
    })
})

export default router
