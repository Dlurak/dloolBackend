import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * A function to generate a JWT token
 * @param username The username to generate a token for
 * @returns A JWT token
 */
export function generateToken(username: string): string {
    const payload = {
        username,
    };

    const options: jwt.SignOptions = {
        expiresIn: '1h',
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, options);

    return token;
}
