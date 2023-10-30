import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import userRouter from './routes/auth/router';
import schoolRouter from './routes/schools/router';
import classRouter from './routes/classes/router';
import homeworkRouter from './routes/homework/router';
import notesRouter from './routes/notes/router';
import eventRouter from './routes/events/router';

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

export let serverIsRunning = false;
export const server = app.listen(port, '0.0.0.0', () => {
    serverIsRunning = true;
    console.log(`Server is running on port ${process.env.PORT}`);
});

/**
 * @api {get} / Get API info
 * @apiName GetAPIInfo
 * @apiGroup General
 * @apiDescription This endpoint is used to get information about the API, the TS-SDK uses this endpoint to check that the url is a Dlool API.
 *
 * @apiSuccess (200) {String} name Name of the API, when you want to deploy a own instance this is where you can name your deployment.
 * @apiSuccess (200) {Boolean} isDlool This value will always be true, it's just a way to check that you are using a Dlool API.
 *
 * @apiSuccessExample {json} Official Response:
 *    HTTP/1.1 200 Success
 *    {
 *       "name": "Dlool",
 *      "isDlool": true
 *    }
 */
app.all('/', (req, res) => {
    res.status(200).json({
        name: 'Dlool',
        isDlool: true,
    });
});

app.use('/auth', userRouter);
app.use('/schools?', schoolRouter);
app.use('/class(es)?', classRouter);
app.use('/homework', homeworkRouter);
app.use('/notes?', notesRouter);
app.use('/events?', eventRouter);
