import express from 'express';
import pagination from '../../../middleware/pagination';
import {
    findClassBySchoolNameAndClassName,
    getClassAndSchoolNameById,
} from '../../../database/classes/findClass';
import { getPaginationPageCount } from '../../../database/utils/getPaginatedData';
import { eventsCollection } from '../../../database/events/event';
import { findUserById } from '../../../database/user/findUser';
import { UserWithId } from '../../../database/user/user';

const router = express.Router();

router.get('/', pagination, async (req, res) => {
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

    const currentDateTime = new Date();
    const currentTimestamp = currentDateTime.getTime();
    const currentPage = res.locals.pagination.page as number;
    const pageSize = res.locals.pagination.pageSize as number;

    const data = await eventsCollection
        .aggregate([
            {
                $match: filter,
            },

            {
                $addFields: {
                    jsDate: {
                        $dateFromParts: {
                            year: '$date.year',
                            month: '$date.month',
                            day: '$date.day',
                            hour: '$date.hour',
                            minute: '$date.minute',
                        },
                    },
                },
            },
            {
                $addFields: {
                    timestamp: { $toLong: '$jsDate' },
                },
            },
            {
                $addFields: {
                    timeDifference: {
                        $abs: { $subtract: ['$timestamp', currentTimestamp] },
                    },
                },
            },
            {
                $sort: {
                    timeDifference: 1,
                },
            },

            // remove the new fields
            {
                $project: {
                    jsDate: 0,
                    timestamp: 0,
                    timeDifference: 0,
                },
            },

            {
                $skip: (currentPage - 1) * pageSize,
            },
            {
                $limit: pageSize,
            },
        ])
        .toArray();

    const mappedDataPromises = data.map(async (event) => {
        const classId = event.class;
        const schoolAndClassData = await getClassAndSchoolNameById(classId);
        if (!schoolAndClassData) {
            return event;
        }
        const { schoolName, className } = schoolAndClassData;

        const editorObjs = await Promise.all(event.editors.map(findUserById));
        const editors = editorObjs.map((editor) => (editor as UserWithId).name);

        return {
            ...event,
            school: schoolName,
            class: className,
            editors,
        };
    });

    const mappedData = await Promise.all(mappedDataPromises);
    const pageCount = await getPaginationPageCount(
        eventsCollection,
        pageSize,
        filter,
    );

    res.status(200).json({
        status: 'success',
        message: 'Events found',
        data: {
            events: mappedData,
            pageCount,
        },
    });
});

export default router;
