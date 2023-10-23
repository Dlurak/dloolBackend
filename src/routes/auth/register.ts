import express from 'express';
import { User } from '../../database/user/user';
import { createUser } from '../../database/user/createUser';
import doesUsernameExist from '../../database/user/doesUserExist';
import {
    doesSchoolExist,
    findUniqueSchool,
} from '../../database/school/findSchool';
import { findClass } from '../../database/classes/findClass';
import findUsername from '../../database/user/findUser';
import { addMemberToClass } from '../../database/classes/update';
import { createAddToClassRequest } from '../../database/requests/createAddToClassRequest';
import { AddToClassRequest } from '../../database/requests/addToClassRequests';

import { z } from 'zod';
import {
    hasLowercaseLetter,
    hasNumber,
    hasSpecialCharacter,
    hasUppercaseLetter,
    specialCharacters,
} from '../../utils/strings';
import { SchoolWithId } from '../../database/school/school';
import { doesRequestExist } from '../../database/requests/findAddToClassRequests';

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
 * @apiBody {String} [email] The email of the user
 *
 *
 * @apiSuccess (201) {String} status Status of the request (success).
 * @apiSuccess (201) {String} message Message of the request (User created).
 * @apiSuccess (201) {Object} [data] Data of the request.
 * @apiSuccess (201) {String} data.id The id of the request.
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
 *       "message": "Successfully created request",
 *       "data": {
 *           id: "5f9a3b3b9f6b3b1b3c9f6b3b"
 *        }
 *    }
 *
 * @apiExample {javascript} JavaScript example:
 *    let headersList = {
 *     "Content-Type": "application/json"
 *    }
 *
 *    let bodyContent = JSON.stringify({
 *      "username": "HappyNoName",
 *      "name": "NoName",
 *      "password": "lowercaseandUPPERCASEand1numberand8charsLong!",
 *      "school": "Hogwarts",
 *      "class": "1a",
 *
 *      "email": "noreply@noreply.com"
 *    });
 *
 *    let response = await fetch("http://localhost:3000/auth/register", {
 *      method: "POST",
 *      body: bodyContent,
 *      headers: headersList
 *    });
 *
 *    let data = await response.json();
 *    console.log(data);
 *
 * @apiPermission none
 *
 * @apiError (400) {String} status Status of the request (error).
 * @apiError (400) {String} message Error message.
 * @apiError (400) {Object} [errors] Errors of the request.
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
    const genTypeErrorMessage = (key: string, type: string) =>
        `Expected ${key} to be of type ${type}`;
    const genMissingErrorMessage = (key: string) =>
        `Missing ${key} in request body`;
    const genErrorMessages = (key: string, type: string) => ({
        invalid_type_error: genTypeErrorMessage(key, type),
        required_error: genMissingErrorMessage(key),
    });
    const genEmptyErrorMessage = (key: string) => ({
        message: genMissingErrorMessage(key),
    });

    const schema = z.object({
        username: z
            .string(genErrorMessages('username', 'string'))
            .min(1, genEmptyErrorMessage('username'))
            .refine(
                async (username) => {
                    const registeredUsernameExistsPromise =
                        doesUsernameExist(username);
                    const signupRequestUsernameExistsPromise =
                        doesRequestExist(username);
                    const promiseList = [
                        registeredUsernameExistsPromise,
                        signupRequestUsernameExistsPromise,
                    ];
                    const existList = await Promise.all(promiseList);
                    const valid = existList.every((exists) => !exists);
                    return valid;
                },
                (username) => ({
                    message: `User ${username} already exists`,
                }),
            ),
        name: z
            .string(genErrorMessages('name', 'string'))
            .min(1, genEmptyErrorMessage('name')),
        password: z
            .string(genErrorMessages('password', 'string'))
            .min(8, { message: 'Password must be at least 8 characters long' })
            .refine(hasLowercaseLetter, {
                message: 'Password must contain at least one lowercase letter',
            })
            .refine(hasUppercaseLetter, {
                message: 'Password must contain at least one uppercase letter',
            })
            .refine(hasNumber, {
                message: 'Password must contain at least one number',
            })
            .refine(hasSpecialCharacter, {
                message: `Password must contain at least one of those characters: ${specialCharacters}`,
            }),
        school: z
            .string(genErrorMessages('school', 'string'))
            .min(1, genEmptyErrorMessage('school'))
            .refine(doesSchoolExist, (school) => ({
                message: `School ${school} does not exist`,
            })),
        class: z
            .string(genErrorMessages('class', 'string'))
            .min(1, genEmptyErrorMessage('class')),

        email: z
            .string({
                invalid_type_error: genTypeErrorMessage('email', 'string'),
            })
            .email({ message: 'Invalid email' })
            .optional(),
    });

    const result = await schema.safeParseAsync(req.body);

    if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;

        const errors = Object.values(fieldErrors);
        const flatErrors = errors.reduce((acc, val) => acc.concat(val), []);

        res.status(400).json({
            status: 'error',
            message: flatErrors[0],
            errors: fieldErrors,
        });
        return;
    }

    // body.school is the unique name so we need to find the id
    const school = (await findUniqueSchool(result.data.school)) as SchoolWithId;
    const schoolId = school._id;

    const classObject = await findClass(school, result.data.class);
    if (classObject === null) {
        res.status(400).json({
            status: 'error',
            message: `Class ${result.data.class} does not exist`,
        });
        return;
    }

    const { username, name, password } = result.data;
    const email = result.data.email ?? null;

    const user: User = {
        username,
        name,
        password,

        school: schoolId,
        classes: [classObject._id],

        email,
    };

    // check if the class already has a user
    const users = classObject.members;
    if (users.length > 0) {
        // create a request
        const addToClassRequest: AddToClassRequest = {
            userDetails: {
                name,
                username,
                createdAt: Date.now(),
                school: schoolId,
                password,

                email,

                acceptedClasses: [],
            },
            classId: classObject._id,
            createdAt: Date.now(),
            status: 'pending',
            processedBy: null,
        };

        const newRequest = await createAddToClassRequest(addToClassRequest);

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
            data: {
                id: newRequest._id,
            },
        });
    }

    if (await createUser(user)) {
        const newUser = await findUsername(username);
        if (newUser === null)
            return res.status(500).json({
                status: 'error',
                error: 'Internal server error',
            });

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
