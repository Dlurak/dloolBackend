import express from 'express';
import authenticate from '../../middleware/auth';
import { isDateTimeValid } from '../../utils/date';
import { findClassBySchoolNameAndClassName } from '../../database/classes/findClass';
import { WithId } from 'mongodb';
import { Class } from '../../database/classes/class';
import findUsername from '../../database/user/findUser';
import { CalEvent } from '../../database/events/event';
import { createEvent } from '../../database/events/createEvent';

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

    const classObj = validationStatus[1];

    const editors = [userObj._id];
    const classId = classObj._id;

    const event: CalEvent = {
        title: body.title as string,
        description: body.description as string,
        date: body.date as any,
        duration: body.duration as number,
        subject: body.subject as string,
        editors,
        editedAd: [new Date().getTime()],
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
