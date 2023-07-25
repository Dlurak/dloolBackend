import express from 'express';
import createHomeworkRouter from './createHomework';
import getHomeworkRouter from './getHomework';

const router = express.Router();

router.use('/', createHomeworkRouter);
router.use('/', getHomeworkRouter);
router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
