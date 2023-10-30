import express from 'express';

import getSpecificRequestRouter from './getSpecificRequest';
import getSpecificRequestSSERouter from './getSpecificRequestSSE';
import getListOfRequestsRouter from './listRequest';
import processRequestRouter from './processRequest';

const router = express.Router();

router.use('/', getSpecificRequestRouter);
router.use('/', getSpecificRequestSSERouter);
router.use('/', getListOfRequestsRouter);
router.use('/', processRequestRouter);

export default router;
