import express from 'express';
import createClassRouter from './createClass';

const router = express.Router();

router.use('/', createClassRouter);
router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
