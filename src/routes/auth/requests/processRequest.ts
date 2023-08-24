import express from 'express';
import { ObjectId } from 'mongodb';
import { findSpecificRequestById } from '../../../database/requests/findAddToClassRequests';
import authenticate from '../../../middleware/auth';
import findUsername from '../../../database/user/findUser';
import {
    acceptRequest,
    rejectRequest,
} from '../../../database/requests/changeAddToClassRequestStatus';

const router = express.Router();

/**
 * @api {patch} /auth/requests/:id/:operator Process a request
 * @apiName ProcessRequest
 * @apiGroup Requests
 * @apiDescription Process a request to join a class. The request must be pending. It can be accepted or rejected.
 * @apiPermission The user must be a member of the class that the request is for
 *
 * @apiParam {String} id The ID of the request
 * @apiParam {String} operator The operator to use. Must be either `accept` or `reject`
 *
 * @apiSuccess (200) {String} status The status of the request
 * @apiSuccess (200) {String} message A message indicating the status of the request
 *
 * @apiError (400) {String} status The status of the request
 * @apiError (400) {String} message A message indicating the status of the request
 *
 * @apiError (403) {String} status The status of the request
 * @apiError (403) {String} message A message indicating the status of the request
 *
 * @apiError (404) {String} status The status of the request
 * @apiError (404) {String} message A message indicating the status of the request
 *
 * @apiError (500) {String} status The status of the request
 * @apiError (500) {String} message A message indicating the status of the request
 *
 * @apiSuccessExample {json} 200 - Success:
 *    HTTP/1.1 200 OK
 *    {
 *       "status": "Success",
 *       "message": "Request processed"
 *    }
 *
 * @apiErrorExample {json} 400 - Invalid ID:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Invalid ID"
 *    }
 *
 * @apiErrorExample {json} 400 - Request a  already processed:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Request is already processed"
 *    }
 *
 * @apiErrorExample {json} 403 - User doesn't have access to class:
 *    HTTP/1.1 403 Forbidden
 *    {
 *       "status": "error",
 *       "message": "You don't have access to this class yourself"
 *    }
 *
 * @apiErrorExample {json} 404 - Request not found:
 *    HTTP/1.1 404 Not Found
 *    {
 *       "status": "error",
 *       "message": "Request not found"
 *    }
 *
 * @apiErrorExample {json} 500 - User not found:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *       "status": "error",
 *       "message": "User not found"
 *    }
 *
 * @apiUse jwtAuth
 */
router.patch(
    '/:id/:operator(accept|reject)',
    authenticate,
    async (req, res) => {
        const rawId = req.params.id;
        const operator = req.params.operator as 'accept' | 'reject';
        const username = res.locals.jwtPayload.username as string;
        const userObjPromise = findUsername(username);

        if (!ObjectId.isValid(rawId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid ID',
            });
        }

        const document = await findSpecificRequestById(new ObjectId(rawId));
        if (!document) {
            return res.status(404).json({
                status: 'error',
                message: 'Request not found',
            });
        }

        if (document.status !== 'pending') {
            return res.status(400).json({
                status: 'error',
                message: 'Request is already processed',
            });
        }

        const userObj = await userObjPromise;
        if (!userObj) {
            return res.status(500).json({
                status: 'error',
                message: 'User not found',
            });
        }
        const userId = userObj._id;
        const userClasses = userObj.classes;

        if (!userClasses.map(String).includes(String(document.classId))) {
            return res.status(403).json({
                status: 'error',
                message: "You don't have access to this class yourself",
            });
        }

        // VALIDATION PASSED //

        if (operator === 'accept') await acceptRequest(document._id, userId);
        else if (operator === 'reject')
            await rejectRequest(document._id, userId);

        return res.status(200).json({
            status: 'success',
            message: 'Request processed',
        });
    },
);

export default router;
