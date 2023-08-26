import express from 'express';
import createHomeworkRouter from './createHomework';
import getAllHomeworkRouter from './getAllHomework';
import getPaginatedHomeworkRouter from './getPaginatedHomework';
import calendarRouter from './calendar/calendar';
import todoRouter from './todo/todo';
import updateHomeworkRouter from './updateHomework';
import deleteHomeworkRouter from './deleteHomework';

const router = express.Router();

router.use('/', createHomeworkRouter);
router.use('/all', getAllHomeworkRouter);
router.use('/', getPaginatedHomeworkRouter);
router.use('/', calendarRouter);
router.use('/', todoRouter);
router.use('/', updateHomeworkRouter);
router.use('/', deleteHomeworkRouter);
router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
