import express from 'express';
import { User } from '../../database/user/user';
import { createUser } from '../../database/user/createUser';
import doesUsernameExist from '../../database/user/doesUserExist';
import { findUniqueSchool } from '../../database/school/findSchool';
import { findClass } from '../../database/classes/findClass';
import findUsername from '../../database/user/findUser';
import { addMemberToClass } from '../../database/classes/update';
import { createAddToClassRequest } from '../../database/requests/createAddToClassRequest';
import { AddToClassRequest } from '../../database/requests/addToClassRequests';

const router = express.Router();

/**
 * @api {post} /auth/register Register a new user
 * @apiName Register
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiDescription Register a new user
 *
 * @apiBody {String} username The unique username of the user
 * @apiBody {String} name The name of the user it doesn't have to be unique
 * @apiBody {String} password The password of the user it shouldn't be hashed before sending as it is hashed on the server
 * @apiBody {String} school The unique name of the school the user is in
 * @apiBody {String} class The name of the class the user is in
 *
 *
 * @apiSuccess (201) {String} status Status of the request (success).
 * @apiSuccess (201) {String} message Message of the request (User created).
 * @apiSuccessExample {json} Register success:
 *    HTTP/1.1 201 Created
 *    {
 *       "status": "success",
 *       "message": "User created"
 *    }
 *
 * @apiSuccessExample {json} Signup-request success:
 *    HTTP/1.1 201 Created
 *    {
 *       "status": "success",
 *       "message": "Successfully created request"
 *    }
 *
 * @apiExample {curl} Curl example:
 *   curl -X POST -H "Content-Type: application/json" -d '{"username": "username", "name": "name", "password": "password", "school": "school", "class": "class"}' http://localhost:3000/auth/register
 *
 *
 * @apiExample {javascript} JavaScript example:
 *    const data = {
 *       "username": "username",
 *       "name": "name",
 *       "password": "password",
 *       "school": "school",
 *       "class": "class",
 *    };
 *    const response = await fetch('http://localhost:3000/auth/register', {
 *       method: 'POST',
 *       body: JSON.stringify(data),
 *       headers: {
 *          'Content-Type': 'application/json'
 *       }
 *    };
 *
 * @apiPermission none
 *
 * @apiError (400) {String} status Status of the request (error).
 * @apiError (400) {String} error Error message.
 *
 * @apiErrorExample {json} 400:
 *   HTTP/1.1 400 Bad Request
 *  {
 *    "status": "error",
 *    "error": "Missing username in request body"
 *  }
 *
 * @apiError (500) {String} status Status of the request (error).
 * @apiError (500) {String} error Error message (Internal server error).
 *
 * @apiErrorExample {json} 500:
 *  HTTP/1.1 500 Internal Server Error
 *  {
 *     "status": "error",
 *     "error": "Internal server error"
 *  }
 */
router.post('/', async (req, res) => {
    const body = req.body;

    const requiredFields: {
        [key: string]: 'string'; // this is written like this so it can be extended
    } = {
        username: 'string',
        name: 'string',
        password: 'string',
        school: 'string',
        class: 'string',
    };

    for (const entry of Object.entries(requiredFields)) {
        // check that the body has entry[0] as a key
        if (!body[entry[0]]) {
            res.status(400).json({
                status: 'error',
                error: `Missing ${entry[0]} in request body`,
            });
            return;
        }

        // check that the types are correct
        if (typeof body[entry[0]] !== entry[1]) {
            res.status(400).json({
                status: 'error',
                error: `Expected ${entry[0]} to be of type ${entry[1]}`,
            });
            return;
        }
    }

    if (await doesUsernameExist(body.username)) {
        res.status(400).json({
            status: 'error',
            error: `User ${body.username} already exists`,
        });
        return;
    }

    // body.school is the unique name so we need to find the id

    const school = await findUniqueSchool(body.school as string);
    if (school === null) {
        res.status(400).json({
            status: 'error',
            error: `School ${body.school} does not exist`,
        });
        return;
    }
    const schoolId = school._id;
    const classObject = await findClass(school, body.class as string);
    if (classObject === null) {
        res.status(400).json({
            status: 'error',
            error: `Class ${body.class} does not exist`,
        });
        return;
    }

    const user: User = {
        username: body.username,
        name: body.name,
        password: body.password,
        school: schoolId,
        classes: [classObject._id],
    };

    // check if the class already has a user
    const users = classObject.members;
    if (users.length > 0) {
        // create a request
        const addToClassRequest: AddToClassRequest = {
            userDetails: {
                name: body.name,
                username: body.username,
                createdAt: Date.now(),
                school: schoolId,
                password: body.password,
                acceptedClasses: [],
            },
            classId: classObject._id,
            createdAt: Date.now(),
            status: 'pending',
            processedBy: null,
        };

        const newRequest = await createAddToClassRequest({
            userDetails: {
                name: body.name,
                username: body.username,
                createdAt: Date.now(),
                school: schoolId,
                password: body.password,
                acceptedClasses: [],
            },
            classId: classObject._id,
            createdAt: Date.now(),
            status: 'pending',
            processedBy: null,
        });

        if (!newRequest) {
            res.status(500).json({
                status: 'error',
                error: 'Internal server error',
            });
            return;
        }

        return res.status(201).json({
            status: 'success',
            message: 'Successfully created request',
        });
    }

    if (await createUser(user)) {
        const newUser = await findUsername(body.username);
        if (newUser === null) {
            res.status(500).json({
                status: 'error',
                error: 'Internal server error',
            });
            return;
        }

        const userId = newUser._id;
        addMemberToClass(classObject._id, userId);

        res.status(201).json({
            status: 'success',
            message: 'User created',
        });
        return;
    } else {
        res.status(500).json({
            status: 'error',
            error: 'Internal server error',
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
