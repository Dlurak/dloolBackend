import express from 'express';
import { getPaginatedData } from '../../database/utils/getPaginatedData';
import { schoolsCollection } from '../../database/school/school';

const router = express.Router();

/**
 * @api {GET} /schools?page=:page&pageSize=:pageSize Get schools
 * @apiName Get schools
 * @apiGroup Schools
 * @apiVersion  1.0.0
 *
 * @apiQuery {Number} :page The page number
 * @apiQuery {Number} :pageSize The amount of items per page
 *
 * @apiExample {curl} Example usage - curl:
 *   curl http://localhost:3000/schools?page=1&pageSize=10
 * @apiExample {python} Example usage - python:
 *   import requests
 *   page = 1
 *   page_size = 10
 *   response = requests.get(f'http://localhost:3000/schools?page={page}&pageSize={page_size}')
 *   print(response.json())
 * @apiExample {javascript} Example usage - javascript:
 *   const page = 1;
 *   const pageSize = 10;
 *   const response = await fetch(`http://localhost:3000/schools?page=${page}&pageSize=${pageSize}`);
 *   console.log(await response.json());
 * @apiExample {v} Example usage - v:
 *   import net.http
 *   page := 1
 *   page_size := 10
 *   resp := http.get('http://localhost:3000/schools?page=${page}&pageSize=${page_size}')!
 *   println(resp.body)
 *
 * @apiSuccess (200) {String} status The status of the request (success)
 * @apiSuccess (200) {String} message A short message about the status of the request
 * @apiSuccess (200) {Object[]} data The data returned by the request
 * @apiSuccess (200) {Object[]} data.schools The schools
 * @apiSuccess (200) {String} data.schools._id The MongoDB ID of the school
 * @apiSuccess (200) {String} data.schools.name The name of the school
 * @apiSuccess (200) {String} data.schools.description The description of the school
 * @apiSuccess (200) {String} data.schools.uniqueName The unique name of the school
 * @apiSuccess (200) {String} data.schools.timezoneOffset The timezone offset of the school, this value isn't used but still mendatory
 * @apiSuccess (200) {String[]} data.schools.classes The MongoDB IDs of the classes in the school
 * @apiSuccess (200) {Number} data.totalPageCount The total amount of pages
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *    {
 *      "status": "success",
 *      "message": "Schools found",
 *      "data": {
 *          "scshools": [
 *          {
 *              "_id": "64bfc62295f139281cec6c74",
 *              "name": "School",
 *              "description": "This school does not exist it is only for testing purposes",
 *              "uniqueName": "school",
 *              "timezoneOffset": 0,
 *              "classes": [
 *                 "64bfc63195f139281cec6c75"
 *              ]
 *          }
 *      ],
 *      "totalPageCount": 1
 *      }
 *  }
 *
 * @apiError (400) {String} status The status of the request (error)
 * @apiError (400) {String} error A short explaination of the error
 *
 * @apiErrorExample {json} 400 - Missing query parameter:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Missing query parameter pageSize"
 *    }
 * @apiErrorExample {json} 400 - Page number must be greater than 0:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Page number must be greater than 0"
 *    }
 *
 * @apiErrorExample {json} 400 - Page size must be greater than 0:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Page size must be greater than 0"
 *    }
 * @apiErrorExample {json} 400 - Query Parameter must be a number:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Page number must be a number"
 *    }
 */
router.get('/', async (req, res) => {
    const requiredQueryParams = ['page', 'pageSize'];

    for (const param of requiredQueryParams) {
        if (!req.query[param]) {
            res.status(400).json({
                status: 'error',
                error: `Missing query parameter ${param}`,
            });
            return;
        }
    }

    const pageNumber = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);

    if (pageNumber < 1) {
        return res.status(400).json({
            status: 'error',
            error: 'Page number must be greater than 0',
        });
    } else if (pageSize < 1) {
        return res.status(400).json({
            status: 'error',
            error: 'Page size must be greater than 0',
        });
    } else if (isNaN(pageNumber)) {
        return res.status(400).json({
            status: 'error',
            error: 'Page number must be a number',
        });
    } else if (isNaN(pageSize)) {
        return res.status(400).json({
            status: 'error',
            error: 'Page size must be a number',
        });
    }

    return res.status(200).json({
        status: 'success',
        message: 'Schools found',
        data: {
            scshools: await getPaginatedData(
                schoolsCollection,
                pageNumber,
                pageSize,
            ),
            totalPageCount: Math.ceil(
                (await schoolsCollection.countDocuments()) / pageSize,
            ),
        },
    });
});

export default router;
