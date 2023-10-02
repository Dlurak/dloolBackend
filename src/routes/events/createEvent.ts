import express from 'express';
import authenticate from '../../middleware/auth';
import { isDateTimeValid } from '../../utils/date';
import { findClassBySchoolNameAndClassName } from '../../database/classes/findClass';
import { WithId } from 'mongodb';
import { Class } from '../../database/classes/class';
import findUsername from '../../database/user/findUser';
import { CalEvent } from '../../database/events/event';
import { createEvent } from '../../database/events/createEvent';
import { isUserMemberOfClass } from '../../database/user/doesUserExist';

const router = express.Router();

type positiveValidateSuccess = [true, WithId<Class>];
type negativeValidateSuccess = [string, number];

const validate = async (
    body: Record<string, unknown>,
): Promise<positiveValidateSuccess | negativeValidateSuccess> => {
    const keyTypes: Record<string, 'string' | 'object' | 'number'> = {
        title: 'string',
        description: 'string',
        date: 'object',
        duration: 'number',
        subject: 'string',
        school: 'string',
        class: 'string',
    };

    for (const key in keyTypes) {
        if (typeof body[key] !== keyTypes[key]) {
            return [`${key} is not a ${keyTypes[key]}`, 400];
        }
    }

    const dateTimeIsValid = isDateTimeValid(body.date as any);
    if (!dateTimeIsValid) {
        return ['date is invalid', 400];
    }

    const duration = body.duration as number;
    if (duration <= 0) {
        return ['duration must not be negative', 400];
    }

    const classObj = await findClassBySchoolNameAndClassName(
        body.school as string,
        body.class as string,
    );
    if (!classObj) {
        return ['class does not exist', 404];
    }

    return [true, classObj];
};

/**
 * @api {post} /events Create an event
 * @apiName CreateEvent
 * @apiGroup Events
 * @apiDescription Create an event
 *
 * @apiBody {String} title Title of the event
 * @apiBody {String} description Description of the event
 * @apiBody {Object} date Date of the event
 * @apiBody {Number} date.year Year of the event
 * @apiBody {Number{1-12}} date.month Month of the event
 * @apiBody {Number{1-31}} date.day Day of the event
 * @apiBody {Number{0-23}} date.hour Hour of the event
 * @apiBody {Number{0-59}} date.minute Minute of the event
 * @apiBody {Number{0..}} duration Duration of the event in seconds
 * @apiBody {String} subject Subject of the event
 * @apiBody {String} school School of the event
 * @apiBody {String} class Class of the event
 * @apiBody {String} [location] Location of the event
 *
 * @apiError (400) {String="error"} status Status of the response
 * @apiError (400) {String="title is not a string" "description is not a string" "date is not a object" "duraton is not a number" "subject is not a string" "school is not a string" "class is not a string" "date is invalid" "duration must not be negative"} message Error message
 *
 * @apiError (403) {String="error"} status Status of the response
 * @apiError (403) {String="user is not a member of the class"} message Error message
 *
 * @apiError (404) {String="error"} status Status of the response
 * @apiError (404) {String="class does not exist"} message Error message
 *
 * @apiError (500) {String="error"} status Status of the response
 * @apiError (500) {String="internal server error" "user does not exist"} message Error message
 *
 * @apiSuccess (201) {String="success"} status Status of the response
 * @apiSuccess (201) {String="event created"} message Success message
 * @apiSuccess (201) {Object} data Data of the response
 * @apiSuccess (201) {String} data.id ID of the created event
 *
 * @apiUse jwtAuth
 */
router.post('/', authenticate, async (req, res) => {
    const body = req.body;
    const username = res.locals.jwtPayload.username as string;

    const validationStatus = await validate(body);
    if (validationStatus[0] !== true) {
        res.status(validationStatus[1]).json({
            status: 'error',
            message: validationStatus[0],
        });
        return;
    }

    const userObj = await findUsername(username);
    if (!userObj) {
        res.status(500).json({
            status: 'error',
            message: 'user does not exist',
        });
        return;
    }
    const userIsMember = await isUserMemberOfClass(
        username,
        body.class as string,
    );
    if (!userIsMember) {
        res.status(403).json({
            status: 'error',
            message: 'user is not a member of the class',
        });
        return;
    }

    const classObj = validationStatus[1];

    const editors = [userObj._id];
    const classId = classObj._id;
    const bodyLocation = body.location;
    const location = bodyLocation ? bodyLocation + '' : null;

    const event: CalEvent = {
        title: body.title as string,
        description: body.description as string,
        date: body.date as any,
        duration: body.duration as number,
        subject: body.subject as string,
        editors,
        location,
        editedAt: [new Date().getTime()],
        class: classId,
    };

    createEvent(event)
        .then((result) => {
            res.status(201).json({
                status: 'success',
                message: 'event created',
                data: {
                    id: result.insertedId,
                },
            });
        })
        .catch(() => {
            res.status(500).json({
                status: 'error',
                message: 'internal server error',
            });
        });
});

export default router;
