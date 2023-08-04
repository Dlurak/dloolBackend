import express from 'express';
import authenticate from '../../../middleware/auth';
import findUsername from '../../../database/user/findUser';
import { deleteUser } from '../../../database/user/deleteUser';

const router = express.Router();

/**
 * @api {delete} /auth/me Delete the current user
 * @apiname DeleteOwnUser
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiDescription Delete the currently logged in user
 *
 * @apiSuccess (200) {String} status A short status of the request (success)
 * @apiSuccess (200) {String} message A short explaination of the response
 * @apiSuccess (200) {String} data The username of the deleted user
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *       "status": "success",
 *       "message": "Successfully deleted user",
 *       "data": "dlurak"
 *    }
 *
 * @apiUse jwtAuth
 */
router.delete('/', authenticate, async (req, res) => {
    const username = res.locals.jwtPayload.username;
    const user = await findUsername(username);

    if (!user) {
        return res.status(500).json({
            status: 'error',
            error: 'User not found',
        });
    }

    deleteUser(user._id);

    res.status(200).json({
        status: 'success',
        message: 'Successfully deleted user',
        data: res.locals.jwtPayload.username,
    });
});

export default router;
