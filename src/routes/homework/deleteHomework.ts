import express from 'express';
import { deleteHomework } from '../../database/homework/deleteHomework';
import { ObjectId } from 'mongodb';
import authenticate from '../../middleware/auth';

const router = express.Router();

/**
 * @api {delete} /homework/:id Delete homework
 * @apiName DeleteHomework
 * @apiGroup Homework
 * @apiDescription Deletes a homework
 *
 * @apiParam {String} id Homework id
 *
 * @apiSuccess (200) {String} status success
 * @apiSuccess (200) {String} message Homework deleted successfully
 *
 * @apiError (400) {String} status error
 * @apiError (400) {String} message A short message describing the error
 *
 * @apiError (404) {String} status error
 * @apiError (404) {String} message Homework not found
 *
 * @apiUse jwtAuth
 */
router.delete('/:id', authenticate, async (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing homework id',
        });
    }

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid homework id',
        });
    }

    const deletedHomework = await deleteHomework(new ObjectId(id));

    if (!deletedHomework) {
        return res.status(404).json({
            status: 'error',
            message: 'Homework not found',
        });
    }

    return res.status(200).json({
        status: 'success',
        message: 'Homework deleted successfully',
    });
});

export default router;
