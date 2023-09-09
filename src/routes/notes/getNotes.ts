import express from 'express';
import pagination from '../../middleware/pagination';
import {
    getPaginatedData,
    getPaginationPageCount,
} from '../../database/utils/getPaginatedData';
import { noteCollection } from '../../database/notes/notes';

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
 * @apiSuccess {String="private"} data.notes.visibility The visibility of the note
 * @apiSuccess {String|null} data.notes.class The ID of the class the note is for. Notes can be individual, so this can be null.
 *
 * @apiUse pagination
 */
router.get('/', pagination, async (req, res) => {
    const { page, pageSize } = res.locals.pagination;

    const notes = getPaginatedData(
        noteCollection,
        page,
        pageSize,
        { 'due.year': -1, 'due.month': -1, 'due.day': -1 },
        {
            visibility: 'public',
        },
    );
    const pageCount = getPaginationPageCount(noteCollection, pageSize);

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
