import express from 'express';
import authenticate from '../../../middleware/auth';
import { changeData } from '../../../database/user/changeData';
import findUsername from '../../../database/user/findUser';

const router = express.Router();

/**
 * @api {patch} /auth/me Change user data
 * @apiName ChangeUserData
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiDescription Change the currently logged in user's data. After changing the username,
 *    the user will need to create a new token or a lot of endpoints will have a 500 error.
 *    This can be done using the /auth/login endpoint.
 *
 * @apiBody (Body) {String} [username] The new username
 * @apiBody (Body) {String} [name] The new name
 * @apiBody (Body) {String} [password] The new password
 *
 * @apiExample {curl} Example usage - curl:
 *    curl -X PATCH -H "Content-Type: application/json" -d '{"username": "dlurak", "name": "Dlurak"}' http://localhost:3000/auth/me
 * @apiExample {JavaScript} Example usage - JavaScript:
 *    const response = await fetch('http://localhost:3000/auth/me', {
 *       method: 'PATCH',
 *       headers: new Headers({
 *          'Content-Type': 'application/json',
 *          'Authorization': 'Bearer ' + token,
 *       })
 *    });
 *    console.log(await response.json());
 *
 * @apiSuccess (200) {String} status A short status of the request (success)
 * @apiSuccess (200) {String} message A short explaination of the response
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    X-Powered-By: Express
 *    Access-Control-Allow-Origin: *
 *    Content-Type: application/json; charset=utf-8
 *    Content-Length: 63
 *    ETag: W/"3f-Ag5/LYYmO55gKyeWLD86Spb1/sw"
 *    Date: Fri, 04 Aug 2023 21:10:14 GMT
 *    Connection: close
 *
 *    {
 *      "status": "success",
 *      "message": "Successfully changed user data"
 *    }
 *
 * @apiError (500) {String} status A short status of the request (error)
 * @apiError (500) {String} error A short explaination of the error
 * @apiError (500) {String} hint A hint to what the user can try to fix the error
 *
 * @apiErrorExample {json} 500 - User not found:
 *    HTTP/1.1 500 Can't find user
 *    {
 *       "status": "error",
 *       "message": "User not found",
 *       "hint": "Maybe you changed your username? In that case you need to login again!"
 *    }
 *
 * @apiUse jwtAuth
 */
router.patch('/', authenticate, async (req, res) => {
    const body = req.body;
    const username = res.locals.jwtPayload.username;

    const options = {
        username: body.username,
        name: body.name,
        password: body.password,
    };

    const userId = (await findUsername(username))?._id;

    if (!userId) {
        return res.status(500).json({
            status: 'error',
            error: 'User not found',
            hint: 'Maybe you changed your username? In that case you need to login again!',
        });
    }

    await changeData(userId, options);

    res.status(200).json({
        status: 'success',
        message: 'Successfully changed user data',
    });
});

export default router;
