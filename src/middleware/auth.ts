import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({
            status: 'error',
            message: 'Missing authorization header',
        });
        return;
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid token',
            });
            return;
        }

        res.locals.jwtPayload = decoded;
        next();
    });
};

export default authenticate;
