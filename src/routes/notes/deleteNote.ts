import express from 'express';
import { ObjectId } from 'mongodb';
import { noteCollection } from '../../database/notes/notes';
import authenticate from '../../middleware/auth';
import findUsername from '../../database/user/findUser';

const router = express.Router();

/**
 * @api {delete} /notes/:id Delete note
 * @apiName DeleteNote
 * @apiGroup Notes
 * @apiDescription Delete a note
 * When a note is deleted, it is deleted permanently. There is no way to recover it.
 * The note can only be deleted by the user who created it.
 *
 * @apiParam {String} id The ID of the note
 *
 * @apiSuccess {String="success"} status The status of the request
 * @apiSuccess {String="Note deleted"} message A message about the request status
 *
 * @apiError (400) {String=error} status The status of the request
 * @apiError (400) {String="Invalid ID"} message A message about the request status
 *
 * @apiError (404) {String=error} status The status of the request
 * @apiError (404) {String="Note not found"} message This can also occur if the note exists, but the user is not the creator of the note
 *
 * @apiError (500) {String=error} status The status of the request
 * @apiError (500) {String="User not found" "Internal server error"} message A message about the request status
 *
 * @apiUse jwtAuth
 */
router.delete('/:id', authenticate, async (req, res) => {
    //--//--// VALIDATION //--//--//
    const id = req.params.id;
    if (!ObjectId.isValid(id))
        return res.sendStatus(400).json({
            status: 'error',
            message: 'Invalid ID',
        });

    const username = res.locals.jwtPayload?.username as string;
    const userObj = await findUsername(username);
    const userId = userObj?._id;
    if (!userId) {
        return res.status(500).json({
            status: 'error',
            message: 'User not found',
        });
    }

    const validNotes = await noteCollection.countDocuments({
        _id: new ObjectId(id),
        creator: userId,
    });
    if (validNotes !== 1) {
        return res.status(404).json({
            status: 'error',
            message: 'Note not found',
        });
    }

    //--//--// DELETE NOTE //--//--//
    noteCollection
        .deleteOne({ _id: new ObjectId(id) })
        .then(() => {
            return res.status(200).json({
                status: 'success',
                message: 'Note deleted',
            });
        })
        .catch(() => {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            });
        });
});

export default router;
