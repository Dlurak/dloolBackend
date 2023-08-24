import express from 'express';

import createClassRouter from './createClass';
import getClassRouter from './getClass';
import getspecificClassRouter from './getSpecificClass';
import getSpecificClassByIdRouter from './getSpecificClassById';

const router = express.Router();

router.use('/', createClassRouter);
router.use('/', getClassRouter);
router.use('/', getspecificClassRouter);
router.use('/', getSpecificClassByIdRouter);
router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
