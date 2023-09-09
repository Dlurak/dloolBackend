import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import userRouter from './routes/auth/router';
import schoolRouter from './routes/schools/router';
import classRouter from './routes/classes/router';
import homeworkRouter from './routes/homework/router';
import notesRouter from './routes/notes/router';

dotenv.config({ path: '.env.public' });

const app = express();

app.use(express.json());
app.use(cors<Request>());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid JSON',
        });
    } else {
        next();
    }
});

const port = +(process.env.PORT as string) || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

app.all('/', (req, res) => {
    res.status(400).json({
        status: 'error',
        message: "This route isn't defined",
    });
});

app.use('/auth', userRouter);
app.use('/schools?', schoolRouter);
app.use('/class(es)?', classRouter);
app.use('/homework', homeworkRouter);
app.use('/notes?', notesRouter);
