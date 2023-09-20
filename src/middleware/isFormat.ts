import { NextFunction, Request, Response } from 'express';

export const jsonAccepter = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    return req.accepts('application/json') ? next() : next('route');
};

export const htmlAccepter = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    return req.accepts('text/html') ? next() : next('route');
};

export const icalAccepter = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    return req.accepts('text/calendar') ? next() : next('route');
};
