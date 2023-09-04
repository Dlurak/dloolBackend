import { findUniqueSchool } from '../../database/school/findSchool';
import { findClass } from '../../database/classes/findClass';
import express from 'express';
import { getPaginatedData } from '../../database/utils/getPaginatedData';
import { homeworkCollection } from '../../database/homework/homework';
import pagination from '../../middleware/pagination';

const router = express.Router();

/**
 * @api {GET} /homework?class=:class&school=:school&page=:page&pageSize=:pageSize Get homework
 * @apiName Get homework
 * @apiGroup Homework
 * @apiVersion  1.0.0
 *
 * @apiQuery {String} :class The name of the class
 * @apiQuery {String} :school The name of the school
 *
 * @apiExample {curl} Example usage - curl:
 *    curl http://localhost:3000/homework?class=1a&school=Hogwarts&page=1&pageSize=10
 * @apiExample {python} Example usage - python:
 *   import requests
 *   school = 'Hogwarts'
 *   className = '1a'
 *   page = 1
 *   page_size = 10
 *   response = requests.get(f'http://localhost:3000/homework?class={className}&school={school}&page={page}&pageSize={page_size}')
 *   print(response.json())
 * @apiExample {javascript} Example usage - javascript:
 *   const response = await fetch('http://localhost:3000/homework?class=1a&school=Hogwarts&page=1&pageSize=10');
 *   const data = await response.json();
 *   console.log(data);
 * @apiExample {v} Example usage - v:
 *   import net.http
 *   school := 'Hogwarts'
 *   class_name := '1a'
 *   page := 1
 *   page_size := 10
 *   resp := http.get('http://localhost:3000/homework?class=${class_name}&school=${school}&page=${page}&pageSize=${page_size}')!
 *   println(resp.body)
 *
 * @apiError (400) {String} status The status of the request (error)
 * @apiError (400) {String} error A short explaination of the error
 *
 * @apiErrorExample {json} 400 - Missing query parameter
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "error": "Missing query parameter class"
 *    }
 *
 * @apiErrorExample {json} 400 - The school doesn't exist
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "error": "The school Hogwarts does not exist"
 *    }
 *
 * @apiErrorExample {json} 400 - The class doesn't exist
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "error": "The class 1a does not exist in the school Hogwarts"
 *    }
 *
 *
 *
 * @apiSuccess (200) {String} status A status (success)
 * @apiSuccess (200) {String} message A short explaination (Homework found)
 *
 * @apiSuccess (200) {Object[]} data The actual data
 * @apiSuccess (200) {Number} data.totalPageCount The total amount of pages with the given page size
 *
 * @apiSuccess (200) {String} data.homework.creator The MongoDB ID of the creator of that homework
 * @apiSuccess (200) {String} data.homework.class The MongoDB ID of the class that homework is for
 * @apiSuccess (200) {Number} data.homework.createdAt The UNIX timestamp in milliseconds at which the homework was added to the system
 * @apiSuccess (200) {Object} data.homework.from The date the homework is from
 * @apiSuccess (200) {Number} data.homework.from.year The year the homework is from
 * @apiSuccess (200) {Number} data.homework.from.month
 * @apiSuccess (200) {Number} data.homework.from.day
 * @apiSuccess (200) {Object[]} data.homework.assignments The assignments for the given date
 * @apiSuccess (200) {String} data.homework.assignments.subject The subject of the assignment, e.g. math
 * @apiSuccess (200) {String} data.homework.assignments.description A short explanation what the task is
 * @apiSuccess (200) {Object} data.homework.assignments.due The date the assignment is due to
 * @apiSuccess (200) {Number} data.homework.assignments.due.year
 * @apiSuccess (200) {Number} data.homework.assignments.due.month
 * @apiSuccess (200) {Number} data.homework.assignments.due.day
 *
 * @apiUse pagination
 */
router.get('/', pagination, async (req, res) => {
    const requiredQueryParams = ['class', 'school'];

    for (const param of requiredQueryParams) {
        if (!req.query[param]) {
            res.status(400).json({
                status: 'error',
                error: `Missing query parameter ${param}`,
            });
            return;
        }
    }

    const className = req.query.class;
    const schoolName = req.query.school;

    const school = await findUniqueSchool(schoolName as string);
    if (!school) {
        res.status(400).json({
            status: 'error',
            error: `The school ${schoolName} does not exist`,
        });
        return;
    }

    const classObj = await findClass(school, className as string);

    if (!classObj) {
        res.status(400).json({
            status: 'error',
            error: `The class ${className} does not exist in the school ${schoolName}`,
        });
        return;
    }

    const { page, pageSize } = res.locals.pagination;

    const homework = await getPaginatedData(homeworkCollection, page, pageSize);

    res.status(200).json({
        status: 'success',
        message: 'Homework found',
        data: {
            homework,
            totalPageCount: Math.ceil(
                (await homeworkCollection.countDocuments()) / pageSize,
            ),
        },
    });
});

export default router;
