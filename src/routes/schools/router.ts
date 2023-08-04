import express from 'express';

import getSchoolRouter from './getSchools';
import createSchoolRouter from './createSchool';

const router = express.Router();

router.use('/', createSchoolRouter);
router.use('/', getSchoolRouter);
router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
