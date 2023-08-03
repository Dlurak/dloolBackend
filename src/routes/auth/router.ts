import express from 'express';

import registerRouter from './register';
import loginRouter from './login';
import meRouter from './me/router';

const router = express.Router();

router.use('/register', registerRouter);
router.use('/login', loginRouter);
router.use('/me', meRouter);

export default router;
