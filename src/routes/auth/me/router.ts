import express from 'express';

import getDataRouter from './getData';
import deleteRouter from './delete';

const router = express.Router();

router.use('/', getDataRouter);
router.use('/', deleteRouter);

export default router;
