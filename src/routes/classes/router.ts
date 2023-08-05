import express from 'express';

import createClassRouter from './createClass';
import getClassRouter from './getClass';
import getspecificClassRouter from './getSpecificClass';

const router = express.Router();

router.use('/', createClassRouter);
router.use('/', getClassRouter);
router.use('/', getspecificClassRouter);
router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
