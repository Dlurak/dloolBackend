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

/**
 * A middleware that optionally authenticates a user using JWT
 * The JWT payload is stored in <code>res.locals.jwtPayload</code>
 * The authentication status is stored in the boolean <code>res.locals.authenticated</code>
 */
const authenticateOptional = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.locals.authenticated = false;
        next();
        return;
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err) {
            res.locals.authenticated = false;
            next();
            return;
        }

        res.locals.jwtPayload = decoded;
        res.locals.authenticated = true;
        next();
    });
};

export default authenticate;
export { authenticateOptional };

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

/**
 * @apiDefine jwtAuthOptional User A route that optionally requires authentication using JWT
 *
 * @apiHeader {String} [authehorization] A JSON-Web-Token, prefixed with <code>Bearer</code>
 */
