import { Request, Response, NextFunction } from 'express';

const pagination = (req: Request, res: Response, next: NextFunction) => {
    const requiredQueryParams = ['page', 'pageSize'];

    for (const param of requiredQueryParams) {
        if (!req.query[param]) {
            res.status(400).json({
                status: 'error',
                error: `Missing query parameter ${param}`,
            });
            return;
        }
    }

    const pageNumber = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);

    if (pageNumber < 1) {
        return res.status(400).json({
            status: 'error',
            error: 'Page number must be greater than 0',
        });
    } else if (pageSize < 1) {
        return res.status(400).json({
            status: 'error',
            error: 'Page size must be greater than 0',
        });
    } else if (isNaN(pageNumber)) {
        return res.status(400).json({
            status: 'error',
            error: 'Page number must be a number',
        });
    } else if (isNaN(pageSize)) {
        return res.status(400).json({
            status: 'error',
            error: 'Page size must be a number',
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
 * @apiError (400) {String} status The status of the request (error)
 * @apiError (400) {String} error A short explaination of the error
 *
 * @apiErrorExample {json} 400 - Missing pagination query parameter:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "error": "Missing query parameter pageSize"
 *   }
 * @apiErrorExample {json} 400 - Pagination parameter must be greater than 0:
 *   HTTP/1.1 400 Bad Request
 *   {
 *      "status": "error",
 *      "error": "Page number must be greater than 0"
 *   }
 * @apiErrorExample {json} 400 - Pagination parameter must be a number:
 *    HTTP/1.1 400 Bad Request
 *    {
 *       "status": "error",
 *       "message": "Page size must be a number"
 *    }
 */

export default pagination;
