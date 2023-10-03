import exp from 'constants';
import express from 'express';

const router = express.Router();

router.delete('/', (req, res) => {
    res.status(501).json({
        status: 'error',
        message: 'Not implemented',
    });
});

export default router;
