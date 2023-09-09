import express from 'express';
import pagination from '../../middleware/pagination';
import {
    getPaginatedData,
    getPaginationPageCount,
} from '../../database/utils/getPaginatedData';
import { noteCollection } from '../../database/notes/notes';
import { authenticateOptional } from '../../middleware/auth';
import findUsername from '../../database/user/findUser';

const router = express.Router();

/**
 * @api {get} /notes Get notes
 * @apiName GetNotes
 * @apiGroup Notes
 * @apiDescription Get a paginated list of notes
 *
 * @apiSuccess {String="success"} status The status of the request
 * @apiSuccess {String="Notes retrieved"} message A message about the request status
 * @apiSuccess {Object} data The data returned by the request
 * @apiSuccess {Number} data.pageCount The number of pages of notes
 * @apiSuccess {Object[]} data.notes The notes returned by the request
 * @apiSuccess {String} data.notes._id The ID of the note
 * @apiSuccess {String} data.notes.creator The ID of the note's creator
 * @apiSuccess {Number} data.notes.createdAt The timestamp of when the note was created
 * @apiSuccess {String{64}} data.notes.title The title of the note
 * @apiSuccess {String{512}} data.notes.content The content of the note
 * @apiSuccess {Object} data.notes.due The due date of the note
 * @apiSuccess {Number} data.notes.due.year The year of the due date
 * @apiSuccess {Number{1-12}} data.notes.due.month The month of the due date
 * @apiSuccess {Number{1-31}} data.notes.due.day The day of the due date
 * @apiSuccess {String="private" "public"} data.notes.visibility The visibility of the note
 * @apiSuccess {String|null} data.notes.class The ID of the class the note is for. Notes can be individual, so this can be null.
 *
 * @apiError (500) {String=error} status The status of the request
 * @apiError (500) {String="User not found"} message A message about the request status
 *
 * @apiUse pagination
 * @apiUse jwtAuthOptional
 */
router.get('/', pagination, authenticateOptional, async (req, res) => {
    const { page, pageSize } = res.locals.pagination;
    let query = { visibility: 'public' } as any;

    const isAuthedResLocal = res.locals.authenticated as boolean;
    const username = res.locals.jwtPayload?.username as string | undefined;

    if (isAuthedResLocal && username) {
        const userObj = await findUsername(username);
        if (!userObj)
            return res
                .status(500)
                .json({ status: 'error', message: 'User not found' });

        const userId = userObj._id;
        query = {
            $or: [
                { visibility: 'public' },
                { visibility: 'private', creator: userId },
            ],
        };
    }

    const notes = getPaginatedData(
        noteCollection,
        page,
        pageSize,
        { 'due.year': -1, 'due.month': -1, 'due.day': -1 },
        query,
    );
    const pageCount = getPaginationPageCount(noteCollection, pageSize, query);

    res.status(200).json({
        status: 'success',
        message: 'Notes retrieved',
        data: {
            notes: await notes,
            pageCount: await pageCount,
        },
    });
});

export default router;
