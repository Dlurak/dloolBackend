import express from 'express';
import { ObjectId } from 'mongodb';
import { getUniqueClassById } from '../../database/classes/findClass';

const router = express.Router();

/**
 * @api {GET} /classes/:id Get specific class
 * @apiName Get a specific class by id
 * @apiGroup Classes
 * @apiVersion 1.0.0
 * @apiDescription Get a specific class by its MongoDB ID
 *    This endpoint really needs better documentation,
 *    so if you are willing to do it please open a pull request
 *    - if I read this in the future, please document it finally :)
 *
 * @apiParam {String} id The MongoDB ID of the class
 *
 * @apiExample {curl} Example usage - curl:
 *    curl http://localhost:3000/classes/64bfc63195f139281cec6c75
 *
 * @apiSuccess (200) {String} status The status of the request (success)
 * @apiSuccess (200) {String} message A short message about the status of the request
 * @apiSuccess (200) {Object} data The data returned by the request
 * @apiSuccess (200) {String} data._id The MongoDB ID of the class
 * @apiSuccess (200) {String} data.name The name of the class
 * @apiSuccess (200) {String} data.school The MongoDB ID of the school the class is in
 * @apiSuccess (200) {String[]} data.members The MongoDB IDs of the members of the class
 *
 * @apiError (400) {String} status The status of the request (error)
 * @apiError (400) {String} message A short message about the error
 *
 * @apiError (404) {String} status The status of the request (error)
 * @apiError (404) {String} message A short message about the error
 */
router.get('/:id', async (req, res) => {
    // VALIDATION //
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid class id',
        });
    }
    const classId = new ObjectId(req.params.id);
    const classObj = await getUniqueClassById(classId);
    if (!classObj) {
        return res.status(404).json({
            status: 'error',
            message: 'Class not found',
        });
    }
    // VALIDATION COMPLETE //

    return res.status(200).json({
        status: 'success',
        message: 'Class found',
        data: classObj,
    });
});

export default router;
