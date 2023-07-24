import express from 'express';
import createSchoolRouter from './createSchool';

const router = express.Router();

router.use('/', createSchoolRouter);
router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
