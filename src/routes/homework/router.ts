import express from 'express';
import createHomeworkRouter from './createHomework';

const router = express.Router();

router.use('/', createHomeworkRouter)
router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
