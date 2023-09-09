import express from 'express';

import createNoteRouter from './createNote';

const router = express.Router();

router.use('/', createNoteRouter);
router.all('/', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
    });
});

export default router;
