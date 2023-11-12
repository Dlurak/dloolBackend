import express from 'express';
import { generateToken } from '../../utils/jwt';
import checkUsernamePassword from '../../database/user/checkPassword';
import { z } from 'zod';

const router = express.Router();

const bodySchema = z.object({
    username: z
        .string({
            required_error: 'Missing username in request body',
            invalid_type_error: 'Username must be of type string',
        })
        .min(1, 'Missing username in request body'),
    password: z.string({
        required_error: 'Missing password in request body',
        invalid_type_error: 'Password must be of type string',
    }),
});

/**
 * @api {post} /auth/login Login
 * @apiName Login
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiDescription Retrieve a JWT token to use for authentication
 *
 * @apiBody {String} username The username of the user
 * @apiBody {String} password The password of the user
 *
 * @apiSuccess (200) {String} status Status of the request (success).
 * @apiSuccess (200) {String} message Message of the request (Login successful).
 * @apiSuccess (200) {String} token The JWT token to use for authentication, it will expire after 1 hour.
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK
 *  {
 *     "status": "success",
 *     "message": "Login successful",
 *  }
 *
 * @apiExample {curl} Curl example:
 *    curl -X POST -H "Content-Type: application/json" -d '{"username": "test", "password": "test"}' http://localhost:3000/auth/login
 *
 * @apiPermission none
 *
 * @apiError (400) {String} status Status of the request (error).
 * @apiError (400) {String} error Error message.
 *
 * @apiError (401) {String} status Status of the request (error).
 * @apiError (401) {String} error Error message.
 *
 * @apiErrorExample {json} 400:
 *  HTTP/1.1 400 Bad Request
 *  {
 *     "status": "error",
 *     "error": "Missing username in request body"
 *  }
 *
 * @apiErrorExample {json} 401:
 *    HTTP/1.1 401 Unauthorized
 *    {
 *       "status": "error",
 *       "error": "Incorrect username or password"
 *    }
 */
router.post('/', async (req, res) => {
    const rawBody = req.body;

    const parsedBody = bodySchema.safeParse(rawBody);
    if (!parsedBody.success) {
        const errors = Object.values(
            parsedBody.error.flatten().fieldErrors,
        ).flat();

        return res.status(400).json({
            status: 'error',
            message: errors[0],
            errors,
        });
    }

    const body = parsedBody.data;

    const correct = await checkUsernamePassword(body.username, body.password);

    if (correct) {
        const token = generateToken(body.username);
        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            token: token,
        });
        return;
    } else {
        res.status(401).json({
            status: 'error',
            message: 'Incorrect username or password',
        });
        return;
    }
});

router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
