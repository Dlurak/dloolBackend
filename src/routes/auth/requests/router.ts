import express from 'express';

import getSpecificRequestRouter from './getSpecificRequest';

const router = express.Router();

router.use('/', getSpecificRequestRouter);

export default router;
