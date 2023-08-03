import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({
            status: 'error',
            error: 'Missing authorization header',
        });
        return;
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err) {
            res.status(401).json({
                status: 'error',
                error: 'Invalid token',
            });
            return;
        }

        res.locals.jwtPayload = decoded;
        next();
    });
};

export default authenticate;

/**
 * @apiDefine jwtAuth User A route that requires authentication using JWT
 * @apiHeader {String} authehorization A JSON-Web-Token a <code>Bearer</code> should stand in front of it
 * @apiHeaderExample {json} Request-Example:
 *    {
 *       "authorization": Bearer xxxxx.yyyyy.zzzzz
 *    }
 *
 * @apiError (401) {String} status The status of the request
 * @apiError (401) {String} error A short explaination of the error
 *
 * @apiErrorExample {json} 401 - Missing authorization header:
 *    HTTP/1.1 401 Unauthorized
 *    {
 *       "status": "error",
 *       "error": "Missing authorization header"
 *    }
 * @apiErrorExample {json} 401 - Invalid token:
 *    HTTP/1.1 401 Unauthorized
 *    {
 *       "status": "error",
 *       "error": "Invalid token"
 *    }
 *
 * @apiPermission User
 */
