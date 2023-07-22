import express from 'express';
import { createUser } from '../../database/auth/createUser';
import doesUserExist from '../../database/auth/doesUserExist';

const router = express.Router();

router.post('/', async (req, res) => {
    const body = req.body;

    const requiredFields = ['name', 'password', 'school', 'class'];
    for (const field of requiredFields) {
        if (!body[field]) {
            return res.status(400).json({
                status: 'error',
                message: `Missing ${field} in request body`,
            });
        }
    }

    if (
        await doesUserExist({
            name: body.name,
            school: body.school,
            class: body.class.toLowerCase(),
        })
    ) {
        res.status(400).json({
            status: 'error',
            message: 'User already exists',
        });
        return;
    } else {
        const user = {
            name: body.name,
            password: body.password,
            school: body.school,
            class: body.class.toLowerCase(),
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
