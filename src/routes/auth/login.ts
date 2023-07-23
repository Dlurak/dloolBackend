import express from 'express';
import { generateToken } from '../../utils/auth';
import checkUsernamePassword from '../../database/auth/checkPassword';

const router = express.Router();

router.post('/', async (req, res) => {
    const body = req.body;

    const requiredFields = ['username', 'password'];
    for (const field of requiredFields) {
        if (!body[field]) {
            return res.status(400).json({
                status: 'error',
                message: `Missing ${field} in request body`,
            });
        }
    }

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
