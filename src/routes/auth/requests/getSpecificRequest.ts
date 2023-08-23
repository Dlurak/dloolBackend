import express from 'express';
import { findSpecificRequestById } from '../../../database/requests/findAddToClassRequests';
import { ObjectId } from 'mongodb';

const router = express.Router();

/**
 * @api {get} /auth/requests/:id Get specific request
 * @apiName GetSpecificRequest
 * @apiGroup Requests
 * @apiDescription Get specific request by id
 * @apiParam {String} id Request id
 * @apiParamExample {json} URL-Example:
 *    /auth/requests/64e5c4994b9074d2afbba014
 *
 * @apiSuccess (200) {String} status Status of the request.
 * @apiSuccess (200) {String} message Message of the request.
 * @apiSuccess (200) {Object} data Data of the request.
 * @apiSuccess (200) {Object} data.userDetails Details of the user who requested to join the class.
 * @apiSuccess (200) {String} data.userDetails.name The name of the user-
 * @apiSuccess (200) {String} data.userDetails.username The username of the user.
 * @apiSuccess (200) {Number} data.userDetails.createdAt The timestamp of when the user was created.
 * @apiSuccess (200) {String} data.userDetails.school The MongoDB ObjectId of the school the user is in.
 * @apiSuccess (200) {String[]} data.userDetails.acceptedClasses The MongoDB ObjectIds of the classes the user is in.
 * @apiSuccess (200) {String} data.classId The MongoDB ObjectId of the class the user wants to join.
 * @apiSuccess (200) {Number} data.createdAt The timestamp of when the request was created.
 * @apiSuccess (200) {pending|rejected|accepted} data.status The status of the request.
 *
 * @apiError (400) {String} status Status of the request.
 * @apiError (400) {String} message A short error message.
 *
 * @apiError (404) {String} status Status of the request.
 * @apiError (404) {String} message A short error message.
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *      "status": "success",
 *      "message": "Request found",
 *      "data": {
 *        "userDetails": {
 *          "name": "dlurak",
 *          "username": "dlurak",
 *          "createdAt": 1692779673405,
 *          "school": "64e5c2099bd19b99be83bf7e",
 *          "acceptedClasses": []
 *        },
 *        "classId": "64e5c4514b9074d2afbba012",
 *        "createdAt": 1692779673432,
 *        "status": "pending",
 *        "processedBy": null
 *      }
 *    }
 *
 * @apiErrorExample {json} 400 Invalid id:
 *    {
 *      "status": "error",
 *      "message": "Invalid id"
 *    }
 * @apiErrorExample {json} 404 Request not found:
 *    {
 *      "status": "error",
 *      "message": "Request not found"
 *    }
 */
router.get('/:id', async (req, res) => {
    // check if the id is valid
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid id' });
    }

    const document = await findSpecificRequestById(new ObjectId(req.params.id));

    if (!document) {
        return res.status(404).json({
            status: 'error',
            message: 'Request not found',
        });
    }

    const userDetails = document.userDetails;

    return res.status(200).json({
        status: 'success',
        message: 'Request found',
        data: {
            userDetails: {
                name: userDetails.name,
                username: userDetails.username,
                createdAt: userDetails.createdAt,
                school: userDetails.school,
                acceptedClasses: userDetails.acceptedClasses,
            },
            classId: document.classId,
            createdAt: document.createdAt,
            status: document.status,
            processedBy: document.processedBy,
        },
    });
});

export default router;
