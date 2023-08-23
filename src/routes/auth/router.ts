import express from 'express';

import registerRouter from './register';
import loginRouter from './login';
import meRouter from './me/router';
import requestsRouter from './requests/router';

const router = express.Router();

router.use('/register', registerRouter);
router.use('/login', loginRouter);
router.use('/me', meRouter);
router.use('/requests?', requestsRouter);

export default router;
