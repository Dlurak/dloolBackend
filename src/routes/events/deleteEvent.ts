import express from 'express';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { eventsCollection } from '../../database/events/event';
import authenticate from '../../middleware/auth';

const router = express.Router();

/**
 * @api {delete} /events/:id Delete event
 * @apiName DeleteEvent
 * @apiGroup Events
 * @apiDescription Delete event
 *
 * @apiParam {String} id Event id
 *
 * @apiSuccess (200) {String=success} status success
 * @apiSuccess (200) {String="Event deleted successfully"} message Event deleted successfully
 *
 * @apiError (400) {String=error} status error
 * @apiError (400) {String="Invalid id"} message A short message describing the error
 * @apiError (400) {String[]} errors An array of all validation errors
 *
 * @apiError (404) {String=error} status error
 * @apiError (404) {String="Event not found"} message Event not found
 *
 * @apiUse jwtAuth
 */
router.delete('/:id', authenticate, async (req, res) => {
    const idParam = req.params.id;

    const idZ = z
        .string()
        .refine((val) => ObjectId.isValid(val), { message: 'Invalid id' });

    const zRes = idZ.safeParse(idParam);

    if (!zRes.success) {
        const errorMessages = zRes.error.issues.map((issue) => issue.message);
        return res.status(400).json({
            status: 'error',
            message: zRes.error.issues[0].message,
            errors: errorMessages,
        });
    }

    const data = (
        await eventsCollection.findOneAndDelete({
            _id: new ObjectId(zRes.data),
        })
    ).value;

    if (!data) {
        return res.status(404).json({
            status: 'error',
            message: 'Event not found',
        });
    }

    res.status(200).json({
        status: 'success',
        message: 'Event deleted successfully',
    });
});

export default router;
