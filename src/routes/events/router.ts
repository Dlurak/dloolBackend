import expess from 'express';

import createEventRouter from './createEvent';

const router = expess.Router();

router.use('/', createEventRouter);
router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
