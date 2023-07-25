import express from 'express';
import dotenv from 'dotenv';

import userRouter from './routes/auth/router';
import schoolRouter from './routes/schools/router';
import classRouter from './routes/classes/router';
import homeworkRouter from './routes/homework/router';

dotenv.config({ path: '.env.public' });

const app = express();

app.use(express.json());

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

app.all('/', (req, res) => {
    res.status(400).json({
        status: 'error',
        message: "This route isn't defined",
    });
});

app.use('/users?', userRouter);
app.use('/schools?', schoolRouter);
app.use('/class(es)?', classRouter);
app.use('/homework', homeworkRouter);
