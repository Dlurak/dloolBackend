import express from 'express';

import getDataRouter from './getData';

const router = express.Router();

router.use('/', getDataRouter);

export default router;
