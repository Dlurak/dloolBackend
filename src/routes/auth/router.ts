import express from 'express';

import registerRouter from './register';
import loginRouter from './login';
import meRouter from './me/router';
import requestsRouter from './requests/router';
import userDetailsRouter from './userDetails';

const router = express.Router();

router.use('/register', registerRouter);
router.use('/login', loginRouter);
router.use('/me', meRouter);
router.use('/requests?', requestsRouter);
router.use('/', userDetailsRouter);

export default router;
