import express from 'express';
import authenticate from '../../../middleware/auth';
import findUsername from '../../../database/user/findUser';
import { findRequestsByClassId } from '../../../database/requests/findAddToClassRequests';
import {
    AddToClassRequest,
    AddToClassRequestStatus,
} from '../../../database/requests/addToClassRequests';
import { WithId } from 'mongodb';

const router = express.Router();

/**
 * @api {get} /auth/requests Get requests
 * @apiName GetRequests
 * @apiGroup Requests
 * @apiDescription Get requests
 * @apiQuery {pending|accepted|rejected|p|a|r} [status] Filter requests by status. When a not supported or none value is given, all requests are returned.
 * @apiParamExample {url} URI-Example:
 *    /auth/requests?status=pending
 *
 * @apiSuccess (200) {String} status Status of the request.
 * @apiSuccess (200) {String} message Message of the request.
 * @apiSuccess (200) {Object[]} data Data of the request.
 * @apiSuccess (200) {Object} data.userDetails Details of the user who requested to join the class.
 * @apiSuccess (200) {String} data.userDetails.name The name of the user-
 * @apiSuccess (200) {String} data.userDetails.username The username of the user.
 * @apiSuccess (200) {Number} data.userDetails.createdAt The timestamp of when the user was created.
 * @apiSuccess (200) {String} data.userDetails.school The MongoDB ObjectId of the school the user is in.
 * @apiSuccess (200) {String[]} data.userDetails.acceptedClasses The MongoDB ObjectIds of the classes the user is in.
 * @apiSuccess (200) {String} data.classId The MongoDB ObjectId of the class the user wants to join.
 * @apiSuccess (200) {Number} data.createdAt The timestamp of when the request was created.
 * @apiSuccess (200) {pending|rejected|accepted} data.status The status of the request.
 * @apiSuccess (200) {String|null} data.processedBy The MongoDB ObjectId of the user who processed the request.
 *
 * @apiError (500) {String} status Status of the request.
 * @apiError (500) {String} message A short error message.
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "status": "success",
 *      "message": "Requests found",
 *      "data": [
 *        {
 *          "_id": "64e61ed936475a58be01f54b",
 *          "userDetails": {
 *            "name": "test",
 *            "username": "test",
 *            "createdAt": 1692802777021,
 *            "school": "64e61ea736475a58be01f548",
 *            "acceptedClasses": []
 *          },
 *          "classId": "64e61eb136475a58be01f549",
 *          "createdAt": 1692802777050,
 *          "status": "pending",
 *          "processedBy": null
 *        }
 *      ]
 *    }
 *
 * @apiErrorExample {json} 500 User not found:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *        "status": "error",
 *        "message": "User not found"
 *    }
 *
 * @apiUse jwtAuth
 */
router.get('/', authenticate, async (req, res) => {
    const username = res.locals.jwtPayload.username;
    const statusDict: {
        [index: string]: AddToClassRequestStatus;
    } = {
        pending: 'pending',
        accepted: 'accepted',
        rejected: 'rejected',
        p: 'pending',
        a: 'accepted',
        r: 'rejected',
    };
    const status: AddToClassRequestStatus | undefined =
        statusDict[req.query.status as string];

    const userObj = await findUsername(username);

    if (!userObj) {
        return res.status(500).json({
            status: 'error',
            message: 'User not found',
        });
    }

    const userClasses = userObj.classes;

    let requests: WithId<AddToClassRequest>[] = [];

    for (const classId of userClasses) {
        const classRequests = await findRequestsByClassId(classId, status);
        requests = [...requests, ...classRequests];
    }

    const cleanedRequests = requests.map((request) => ({
        ...request,
        userDetails: {
            name: request.userDetails.name,
            username: request.userDetails.username,
            createdAt: request.userDetails.createdAt,
            school: request.userDetails.school,
            acceptedClasses: request.userDetails.acceptedClasses,
        },
    }));
    return res.status(200).json({
        status: 'success',
        message: 'Requests found',
        data: cleanedRequests,
    });
});

export default router;
