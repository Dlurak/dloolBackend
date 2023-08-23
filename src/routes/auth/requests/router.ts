import express from 'express';

import getSpecificRequestRouter from './getSpecificRequest';
import getListOfRequestsRouter from './listRequest';

const router = express.Router();

router.use('/', getSpecificRequestRouter);
router.use('/', getListOfRequestsRouter);

export default router;
