import express from 'express';

import getSchoolRouter from './getSchools';
import createSchoolRouter from './createSchool';
import getSpecificSchoolRouter from './getSpecificSchool';

const router = express.Router();

router.use('/', createSchoolRouter);
router.use('/', getSchoolRouter);
router.use('/', getSpecificSchoolRouter);
router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
