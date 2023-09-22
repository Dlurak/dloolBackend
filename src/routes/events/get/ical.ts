import express from 'express';
import { findClassBySchoolNameAndClassName } from '../../../database/classes/findClass';
import { eventsCollection } from '../../../database/events/event';
import ical, { ICalCategory } from 'ical-generator';
import { dateTimeToDate } from '../../../utils/date';

const router = express.Router();

router.get('/', async (req, res) => {
    const schoolName = req.query.school as string;
    const className = req.query.class as string;

    let filter = {};

    if (typeof schoolName === 'string' && typeof className === 'string') {
        const classObj = await findClassBySchoolNameAndClassName(
            schoolName,
            className,
        );

        if (!classObj) {
            res.status(404).json({
                status: 'error',
                message: 'Class not found',
            });
            return;
        }
        filter = { class: classObj._id };
    }

    const data = await eventsCollection.find(filter).toArray();

    const cal = ical({
        name: 'Dlool - Events',
    });

    data.forEach((event) => {
        const startDate = dateTimeToDate(event.date);
        const endDate = new Date(startDate.getTime() + event.duration * 1000);

        cal.createEvent({
            start: startDate,
            end: endDate,
            summary: event.title,
            description: event.description,
            location: event.location,
            allDay: false,
            categories: [new ICalCategory({ name: event.subject })],
            created: new Date(event.editedAt[0]),
            lastModified: new Date(event.editedAt[event.editedAt.length - 1]),
        });
    });

    res.set('Content-Type', 'text/calendar');
    res.status(200).send(cal.toString());
});

export default router;
