import express from 'express';

import getDataRouter from './getData';
import deleteRouter from './delete';
import patchDataRouter from './changeData';

const router = express.Router();

router.use('/', getDataRouter);
router.use('/', deleteRouter);
router.use('/', patchDataRouter);

export default router;
