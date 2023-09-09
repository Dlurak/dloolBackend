import { Request, Response, NextFunction } from 'express';

/**
 * A middleware that checks if the request has pagination query parameters.
 * If it does, it will add the pagination object to res.locals.pagination.
 * If it does not, it will return a 400 error.
 * This middleware should be documented using apiUse pagination
 */
const pagination = (req: Request, res: Response, next: NextFunction) => {
    const requiredQueryParams = ['page', 'pageSize'];

    for (const param of requiredQueryParams) {
        if (!req.query[param]) {
            res.status(400).json({
                status: 'error',
                message: `Missing query parameter ${param}`,
            });
            return;
        }
    }

    const pageNumber = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);

    if (pageNumber < 1) {
        return res.status(400).json({
            status: 'error',
            message: 'Page number must be greater than 0',
        });
    } else if (pageSize < 1) {
        return res.status(400).json({
            status: 'error',
            message: 'Page size must be greater than 0',
        });
    } else if (isNaN(pageNumber)) {
        return res.status(400).json({
            status: 'error',
            message: 'Page number must be a number',
        });
    } else if (isNaN(pageSize)) {
        return res.status(400).json({
            status: 'error',
            message: 'Page size must be a number',
        });
    }

    res.locals.pagination = {
        page: pageNumber,
        pageSize,
    };

    next();
};

/**
 * @apiDefine pagination Pagination A route that requires pagination
 * @apiQuery {Number} page The page number
 * @apiQuery {Number} pageSize The number of items per page
 *
 * @apiError (400) {String="error"} status The status of the request (error)
 * @apiError (400) {String="Missing query parameter pageSize" "Missing query parameter pageNumber" "Page number must be greater than 0" "Page size must be greater than 0" "Page number must be a number" "Page size must be a number"} message A short explaination of the error
 */

export default pagination;
