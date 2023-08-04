import express from 'express';

import createClassRouter from './createClass';
import getClassRouter from './getClass';

const router = express.Router();

router.use('/', createClassRouter);
router.use('/', getClassRouter);
router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
