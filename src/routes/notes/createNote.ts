import express from 'express';
import authenticate from '../../middleware/auth';
import { isDateValid, sortDate } from '../../utils/date';
import findUsername from '../../database/user/findUser';
import { getUniqueClassById } from '../../database/classes/findClass';
import { Note } from '../../database/notes/notes';
import { createNote } from '../../database/notes/createNote';
import { ObjectId } from 'mongodb';

const router = express.Router();

/**
 * @api {post} /notes Create a note
 * @apiName CreateNote
 * @apiGroup Notes
 * @apiDescription Create a note
 * @apiPermission authenticated
 *
 * @apiBody {String{64}} title Title of the note
 * @apiBody {String{512}} content Content of the note
 * @apiBody {Object} due Due date of the note
 * @apiBody {Number} due.year Year of the due date
 * @apiBody {Number} due.month Month of the due date
 * @apiBody {Number} due.day Day of the due date
 * @apiBody {String=private public} [visibility=public] Visibility of the note
 * @apiBody {String} [class] Class of the note
 *
 * @apiSuccess (201) {String=success} status success The status of the request
 * @apiSuccess (201) {String="Note created"} message A short message about the result
 * @apiSuccess (201) {Object} data The data of the result
 * @apiSuccess (201) {Object} data.note The note that was created
 * @apiSuccess (201) {String} data.note._id The ID of the note
 * @apiSuccess (201) {String} data.note.creator The ID of the creator of the note
 * @apiSuccess (201) {Number} data.note.createdAt The timestamp of when the note was created
 * @apiSuccess (201) {String{64}} data.note.title The title of the note
 * @apiSuccess (201) {String{512}} data.note.content The content of the note
 * @apiSuccess (201) {Object} data.note.due The due date of the note
 * @apiSuccess (201) {Number} data.note.due.year The year of the due date
 * @apiSuccess (201) {Number{1-12}} data.note.due.month The month of the due date
 * @apiSuccess (201) {Number{1-31}} data.note.due.day The day of the due date
 * @apiSuccess (201) {String=private public} data.note.visibility The visibility of the note
 * @apiSuccess (201) {String} [data.note.class] The ID of the class the note is associated with
 *
 * @apiError (400) {String=error} status error The status of the request
 * @apiError (400) {String="Invalid title or content" "Title is too long" "Content is too long" "Invalid visibility" "Invalid due date"} message A short message about the error
 *
 * @apiError (404) {String=error} status error The status of the request
 * @apiError (404) {String="Invalid class"} message A short message about the error
 *
 * @apiError (500) {String=error} status error The status of the request
 * @apiError (500) {String="Could not create note" "Could not find user"} message A short message about the error
 */
router.post('/', authenticate, async (req, res) => {
    const body = req.body;

    if (typeof body.title !== 'string' || typeof body.content !== 'string') {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid title or content',
        });
    } else if (body.title.length > 64) {
        return res.status(400).json({
            status: 'error',
            message: 'Title is too long',
        });
    } else if (body.content.length > 512) {
        return res.status(400).json({
            status: 'error',
            message: 'Content is too long',
        });
    } else if (![undefined, 'public', 'private'].includes(body.visibility)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid visibility',
        });
    } else if (!isDateValid(body.due)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid due date',
        });
    }

    const username = res.locals.jwtPayload.username;
    const userPromise = findUsername(username);
    const userObj = await userPromise;
    if (!userObj) {
        return res.status(500).json({
            status: 'error',
            message: 'Could not find user',
        });
    }
    const userId = userObj._id;

    const classId = body.class as string | undefined;
    const isClassValid = !!classId && ObjectId.isValid(classId);
    if (isClassValid) {
        const classObjId = new ObjectId(classId);
        const classes = await getUniqueClassById(classObjId);
        if (!classes) {
            return res.status(404).json({
                status: 'error',
                message: 'Invalid class',
            });
        }
    }

    const note: Note = {
        creator: userId,
        createdAt: Date.now(),

        title: body.title,
        content: body.content,
        due: sortDate(body.due),
        visibility: body.visibility || 'public',
        class: isClassValid ? body.class : null,
    };

    const newNote = await createNote(note);

    if (newNote) {
        return res.status(201).json({
            status: 'success',
            message: 'Note created',
            data: {
                note: newNote,
            },
        });
    } else {
        return res.status(500).json({
            status: 'error',
            message: 'Could not create note',
        });
    }
});

export default router;
