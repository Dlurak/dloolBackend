import express from 'express';
import { ObjectId, UpdateFilter } from 'mongodb';
import authenticate from '../../middleware/auth';
import findUsername from '../../database/user/findUser';
import { noteCollection } from '../../database/notes/notes';
import { isString, isUndefined } from '../../utils/isDatatype';
import { isShorterThan } from '../../utils/isShorterThan';

const router = express.Router();

/**
 * @api {patch} /notes/:id Update note
 * @apiName UpdateNote
 * @apiGroup Notes
 * @apiDescription Update a note
 * The note can only be updated by the user who created it.
 *
 * @apiParam {String} id The ID of the note
 *
 * @apiBody {String{64}} [title] The title of the note
 * @apiBody {String{512}} [content] The content of the note
 *
 * @apiSuccess {String="success"} status The status of the request
 * @apiSuccess {String="Note updated"} message A message about the request status
 *
 * @apiError (400) {String=error} status The status of the request
 * @apiError (400) {String="Invalid ID" "Missing title or content" "Title must be a string" "Content must be a string" "Title must be shorter than 64 characters" "Content must be shorter than 512 characters"} message A message about the request status
 *
 * @apiError (404) {String=error} status The status of the request
 * @apiError (404) {String="Note not found"} message A message about the request status. This error can also occur if the note exists, but the user is not the creator of the note.
 *
 * @apiError (500) {String=error} status The status of the request
 * @apiError (500) {String="User not found" "Internal server error"} message A message about the request status
 *
 * @apiUse jwtAuth
 */
router.patch('/:id', authenticate, async (req, res) => {
    //--//--// VALIDATION //--//--//
    const idString = req.params.id;
    if (!ObjectId.isValid(idString)) {
        return res.sendStatus(400).json({
            status: 'error',
            message: 'Invalid ID',
        });
    }
    const username = res.locals.jwtPayload?.username as string;
    const userObj = await findUsername(username);
    const userId = userObj?._id;
    if (!userId) {
        return res.status(500).json({
            status: 'error',
            message: 'User not found',
        });
    }

    const { title, content } = req.body;
    const titleIsString = isString(title);
    const titleIsUndefined = isUndefined(title);
    const contentIsString = isString(content);
    const contentIsUndefined = isUndefined(content);

    if (titleIsUndefined && contentIsUndefined) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing title or content',
        });
    } else if (!titleIsUndefined && !titleIsString) {
        // if title is given but not a string
        return res.status(400).json({
            status: 'error',
            message: 'Title must be a string',
        });
    } else if (!contentIsUndefined && !contentIsString) {
        // if content is given but not a string
        return res.status(400).json({
            status: 'error',
            message: 'Content must be a string',
        });
    } else if (!titleIsUndefined && !isShorterThan(title, 64)) {
        return res.status(400).json({
            status: 'error',
            message: 'Title must be shorter than 64 characters',
        });
    } else if (!contentIsUndefined && !isShorterThan(content, 512)) {
        return res.status(400).json({
            status: 'error',
            message: 'Content must be shorter than 512 characters',
        });
    }

    //--//--// UPDATE NOTE //--//--//
    const id = new ObjectId(idString);
    const updateFilter: any = { $set: {} };
    if (title !== undefined) updateFilter.$set.title = title;
    if (content !== undefined) updateFilter.$set.content = content;

    noteCollection
        .findOneAndUpdate(
            {
                _id: id,
                creator: userId,
            },
            updateFilter,
        )
        .then((result) => {
            if (result.value === null) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Note not found',
                });
            }
            return res.status(200).json({
                status: 'success',
                message: 'Note updated',
            });
        });
});

export default router;
