import express from 'express';

import registerRouter from './register';
import loginRouter from './login';

const router = express.Router();

router.use('/register', registerRouter);
router.use('/login', loginRouter);

export default router;
