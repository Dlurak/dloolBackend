import express from 'express';
import createHomeworkRouter from './createHomework';
import getAllHomeworkRouter from './getAllHomework';
import getPaginatedHomeworkRouter from './getPaginatedHomework';
import calendarRouter from './calendar/calendar';
import updateHomeworkRouter from './updateHomework';

const router = express.Router();

router.use('/', createHomeworkRouter);
router.use('/all', getAllHomeworkRouter);
router.use('/', getPaginatedHomeworkRouter);
router.use('/', calendarRouter);
router.use('/', updateHomeworkRouter);
router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
