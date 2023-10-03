import expess from 'express';

import createEventRouter from './createEvent';
import getEventsRouter from './getEvents';
import deleteEventRouter from './deleteEvent';

const router = expess.Router();

router.use('/', createEventRouter);
router.use('/', getEventsRouter);
router.use('/', deleteEventRouter);
router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
