import express from 'express';
import { User } from '$database/user/user';
import { createUser } from '../../database/user/createUser';
import doesUsernameExist from '../../database/user/doesUserExist';
import { findUniqueSchool } from '../../database/school/findSchool';
import {
    findClass,
    getClassesFromSchool,
} from '../../database/classes/findClass';
import { ObjectId } from 'mongodb';

const router = express.Router();

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
                message: `Missing ${entry[0]} in request body`,
            });
            return;
        }

        // check that the types are correct
        if (typeof body[entry[0]] !== entry[1]) {
            res.status(400).json({
                status: 'error',
                message: `Expected ${entry[0]} to be of type ${entry[1]}`,
            });
            return;
        }
    }

    if (await doesUsernameExist(body.username)) {
        res.status(400).json({
            status: 'error',
            message: `User ${body.username} already exists`,
        });
        return;
    } else {
        // body.school is the unique name so we need to find the id

        const school = await findUniqueSchool(body.school as string);
        if (school === null) {
            res.status(400).json({
                status: 'error',
                message: `School ${body.school} does not exist`,
            });
            return;
        }
        const schoolId = school._id;
        const classObject = await findClass(school, body.class as string);
        if (classObject === null) {
            res.status(400).json({
                status: 'error',
                message: `Class ${body.class} does not exist`,
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

        if (await createUser(user)) {
            res.status(201).json({
                status: 'success',
                message: 'User created',
            });
            return;
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            });
            return;
        }
    }
});

router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
